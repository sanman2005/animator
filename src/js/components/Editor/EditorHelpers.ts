import { vectorMulti, vectorsPlus } from '../../helpers';

import { IScreenElement } from 'components/Screen';
import { TFrame } from 'components/Timeline';

export const interpolateElementsStates = (
  elements: IScreenElement[],
  frames: TFrame[],
) => {
  const elementsByFrames = frames.map(() => []);

  const interpolateState = (
    elementId: string,
    frameIndexFrom: number,
    frameIndexTo: number,
  ) => { // интерполяция промежуточных состояний
    const statePrev = frames[frameIndexFrom][elementId];
    const stateNext = frames[frameIndexTo][elementId] || statePrev;
    const stepsCount = frameIndexTo - frameIndexFrom;

    const stepPosition = {
      x: (stateNext.position.x - statePrev.position.x) / stepsCount,
      y: (stateNext.position.y - statePrev.position.y) / stepsCount,
    };
    const stepScale = {
      x: (stateNext.scale.x - statePrev.scale.x) / stepsCount,
      y: (stateNext.scale.y - statePrev.scale.y) / stepsCount,
    };
    const stepRotation = (stateNext.rotation - statePrev.rotation) / stepsCount;

    for (let i = frameIndexFrom; i < frameIndexTo; i++) {
      elementsByFrames[i].push({
        ...statePrev,
        position: vectorsPlus(statePrev.position, vectorMulti(stepPosition, i)),
        scale: vectorsPlus(statePrev.scale, vectorMulti(stepScale, i)),
        rotation: statePrev.rotation + stepRotation * i,
      });
    }
  };

  elements.forEach(({ id }) => { // для каждого элемента
    let statePrevFrameIndex: number = null;

    frames.forEach((frame, frameIndex) => {
      if (frame[id]) { // идем по кадрам
        if (statePrevFrameIndex !== null) {
          interpolateState(id, statePrevFrameIndex, frameIndex);
        }

        statePrevFrameIndex = frameIndex;
      }
    });

    if (
      statePrevFrameIndex !== null &&
      statePrevFrameIndex < frames.length - 1
    ) { // и интерполируем состояние на промежуточные кадры
      interpolateState(id, statePrevFrameIndex, frames.length - 1);
    }
  });

  return elementsByFrames;
};
