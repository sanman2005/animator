import React from 'react';

import { ISceneElement, IVector } from 'types';

import { drawElement, prepareElementImage } from './helpers';

interface IScreenCanvasProps {
  elements: ISceneElement[];
  onDraw?: (context: CanvasRenderingContext2D) => void;
  resolution?: IVector;
}

class ScreenCanvas extends React.PureComponent<IScreenCanvasProps> {
  canvas: HTMLCanvasElement = null;

  draw = async () => {
    const { elements, onDraw } = this.props;
    const { canvas } = this;

    if (!canvas || !onDraw) return;

    const context = canvas.getContext('2d');
    const images = await Promise.all(elements.map(prepareElementImage));

    context.textBaseline = 'top';
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach((element, index) =>
      drawElement(context, element, images[index]),
    );

    onDraw(context);
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
