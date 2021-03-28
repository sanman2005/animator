import React from 'react';

import { ISceneElement, IVector } from 'types';

import { drawElement } from './helpers';

interface IScreenCanvasProps {
  elements: ISceneElement[];
  onDraw?: (context: CanvasRenderingContext2D) => void;
  resolution?: IVector;
}

class ScreenCanvas extends React.PureComponent<IScreenCanvasProps> {
  canvas: HTMLCanvasElement = null;

  draw = () => {
    const { elements, onDraw } = this.props;
    const { canvas } = this;

    if (!canvas || !onDraw) return;

    const context = canvas.getContext('2d');
    let drawnElementsCount = elements.length;

    const onDrawElement = (
      element: ISceneElement,
      image?: HTMLImageElement,
    ) => {
      drawElement(context, element, image);

      if (!--drawnElementsCount) onDraw(context);
    };

    context.textBaseline = 'top';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach(element => {
      const isSpeech = element.speech?.text;

      if (isSpeech) return onDrawElement(element);

      const img = new Image();

      img.onload = () => onDrawElement(element, img);
      img.src = element.image;
    });
  };

  render() {
    const { resolution } = this.props;

    this.draw();

    return (
      <canvas
        className='screenCanvas'
        height={resolution?.y}
        ref={ref => (this.canvas = ref)}
        width={resolution?.x}
      />
    );
  }
}

export default ScreenCanvas;
