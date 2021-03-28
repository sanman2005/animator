import { vectorsMinus, vectorMulti, vectorsPlus } from '../../helpers';

import { ISceneElement, TFrame } from 'types';

export const interpolateElementsStates = (
  elements: ISceneElement[],
  frames: TFrame[],
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
