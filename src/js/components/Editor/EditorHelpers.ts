import { vectorsMinus, vectorMulti, vectorsPlus } from '../../helpers';

import { IScreenElement } from 'components/Screen';
import { TFrame } from 'components/Timeline';

export const interpolateElementsStates = (
  elements: IScreenElement[],
  frames: TFrame[],
) => {
  const elementsByFrames: IScreenElement[][] = frames.map(() => []);

  const interpolateState = (
    elementId: string,
    frameIndexFrom: number,
    frameIndexTo: number,
  ) => {
    // интерполяция промежуточных состояний
    const statePrev = frames[frameIndexFrom][elementId];
    const stateNext =
      (frames[frameIndexTo] && frames[frameIndexTo][elementId]) || statePrev;
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
        ...statePrev,
        position: vectorsPlus(
          statePrev.position,
          vectorMulti(stepPosition, step),
        ),
        scale: vectorsPlus(statePrev.scale, vectorMulti(stepScale, step)),
        rotation: statePrev.rotation + stepRotation * step,
      });
    }
  };

  elements.forEach(({ id }) => {
    // для каждого элемента
    let statePrevFrameIndex: number = null;

    frames.forEach((frame, frameIndex) => {
      if (frame[id]) {
        // идем по кадрам
        if (statePrevFrameIndex !== null) {
          interpolateState(id, statePrevFrameIndex, frameIndex);
        }

        statePrevFrameIndex = frameIndex;
      }
    });

    if (
      statePrevFrameIndex !== null &&
      statePrevFrameIndex < frames.length - 1
    ) {
      // и интерполируем состояние на промежуточные кадры
      interpolateState(id, statePrevFrameIndex, frames.length);
    }
  });

  return elementsByFrames;
};
