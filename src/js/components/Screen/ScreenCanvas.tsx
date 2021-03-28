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

    context.textBaseline = 'top';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    const images = [...Array(elements.length)];
    let imagesCount = 0;

    const drawElements = () => {
      elements.forEach((element, index) =>
        drawElement(context, element, images[index]),
      );

      onDraw(context);
    };

    const onLoadImage = () => !--imagesCount && drawElements();

    const prepareImage = (element: ISceneElement, index: number) => {
      const isSpeech = element.speech?.text;

      if (isSpeech) return;

      const img = new Image();

      img.onload = () => onLoadImage();
      img.src = element.image;
      images[index] = img;
      imagesCount++;
    };

    elements.forEach(prepareImage);
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
