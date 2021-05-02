import * as React from 'react';

import Elements from 'js/elements';
import * as fileUploader from 'js/fileLoader';
import { vectorsMinus, vectorMulti, vectorsPlus } from 'js/helpers';

import { ISceneElement, IVector, TFrame } from 'types';
import * as GIFEncoder from 'gifencoder';

export const SPEECH_CATEGORY = 'speech';

type TLoadTemplates = () => Promise<{
  templates: TTemplates;
  categories: TCategories;
}>;

type TTemplate = { id: string; url: string };
export type TTemplates = { [key: string]: TTemplate };
export type TCategories = { [key: string]: TTemplate[] };

export const loadTemplates: TLoadTemplates = async () => {
  const templates: TTemplates = {};
  const categories = Object.keys(Elements).reduce((result, category) => {
    result[category] = Elements[category].map(url => {
      templates[url] = {
        id: url,
        url,
      };

      return templates[url];
    });

    return result;
  }, {} as TCategories);

  const customFiles = await fileUploader.getFiles();

  customFiles?.forEach(({ category, content, name }) => {
    templates[name] = {
      id: name,
      url: content,
    };
    categories[category].push(templates[name]);
  });

  return { templates, categories };
};

export const interpolateElementsStates = (
  elements: ISceneElement[],
  frames: TFrame[],
  templates: TTemplates,
) => {
  const elementsByFrames: ISceneElement[][] = frames.map(() => []);

  const interpolateState = (
    element: ISceneElement,
    frameIndexFrom: number,
    frameIndexTo: number,
  ) => {
    // интерполяция промежуточных состояний
    const statePrev = frames[frameIndexFrom][element.id];
    const stateNext =
      (frames[frameIndexTo] && frames[frameIndexTo][element.id]) || statePrev;
    const stepKoef = 1 / (frameIndexTo - frameIndexFrom);

    const stepPosition = vectorMulti(
      vectorsMinus(stateNext.position, statePrev.position),
      stepKoef,
    );
    const stepScale = vectorMulti(
      vectorsMinus(stateNext.scale, statePrev.scale),
      stepKoef,
    );
    const stepRotation = (stateNext.rotation - statePrev.rotation) * stepKoef;

    for (let i = frameIndexFrom, step = 0; i < frameIndexTo; i++, step++) {
      elementsByFrames[i].push({
        ...element,
        image: templates[element.templateId]?.url,
        position: vectorsPlus(
          statePrev.position,
          vectorMulti(stepPosition, step),
        ),
        scale: vectorsPlus(statePrev.scale, vectorMulti(stepScale, step)),
        rotation: statePrev.rotation + stepRotation * step,
      });
    }
  };

  elements.forEach(element => {
    // для каждого элемента
    const { id, lastFrameIndex } = element;
    let statePrevFrameIndex: number = null;

    frames.forEach((frame, frameIndex) => {
      if (frame[id]) {
        // идем по кадрам
        if (statePrevFrameIndex !== null) {
          // и интерполируем состояние на промежуточные кадры
          const lastIndex = lastFrameIndex
            ? Math.min(lastFrameIndex, frameIndex)
            : frameIndex;

          interpolateState(element, statePrevFrameIndex, lastIndex);
        }

        statePrevFrameIndex = frameIndex;
      }
    });

    if (
      statePrevFrameIndex !== null &&
      statePrevFrameIndex < frames.length - 1
    ) {
      // интерполируем состояние на оставшиеся кадры
      const lastIndex = lastFrameIndex
        ? Math.min(lastFrameIndex, frames.length)
        : frames.length;

      interpolateState(element, statePrevFrameIndex, lastIndex);
    }
  });

  return elementsByFrames;
};

export const getEncoder = async (resolution: IVector, timeInSec: number) => {
  const encoder = new GIFEncoder(resolution.x, resolution.y);
  // @ts-ignore
  const file = await window.showSaveFilePicker({
    types: [
      {
        description: 'Gif',
        accept: { 'image/gif': ['.gif'] },
      },
    ],
  });
  // @ts-ignore
  const stream = await file.createWritable();

  stream.on = () => {};
  stream.once = () => {};
  stream.emit = () => {};
  stream.end = () => stream.close();

  encoder.createReadStream().pipe(stream);

  encoder.start();
  encoder.setRepeat(0); // 0 for repeat, -1 for no-repeat
  encoder.setDelay(timeInSec * 1000); // frame delay in ms
  encoder.setQuality(10); // image quality. 10 is default.

  return encoder;
};
