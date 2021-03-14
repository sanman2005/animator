import React from 'react';

import { ISceneElement, IVector } from 'js/types';

interface IScreenCanvasProps {
  elements: ISceneElement[];
  onDraw?: (context: CanvasRenderingContext2D) => void;
  resolution?: IVector;
}

export default class ScreenCanvas extends React.PureComponent<IScreenCanvasProps> {
  canvas: HTMLCanvasElement = null;

  draw = () => {
    const { elements, onDraw } = this.props;
    const { canvas } = this;

    if (!canvas || !onDraw) return;

    const context = canvas.getContext('2d');
    let waitImagesCount = elements.length;

    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach(
      ({
        height,
        idTemplate,
        rotation,
        position,
        repeatX,
        repeatY,
        scale,
        width,
      }) => {
        const isEffect = repeatX !== 1 || repeatY !== 1;
        const image = new Image();
        const koef = 0.01;
        const x = canvas.width * (0.5 + width * position.x * koef * koef);
        const y = canvas.height * (0.5 + height * position.y * koef * koef);
        const angle = (Math.PI / 180) * rotation;

        image.onload = () => {
          const { naturalHeight, naturalWidth } = image;
          const ratio = naturalWidth / naturalHeight;
          const canvasRatio = canvas.width / canvas.height;
          const correctWidth =
            ratio >= canvasRatio ? width : width / canvasRatio;
          const correctHeight =
            ratio < canvasRatio ? height : height * canvasRatio;
          let scaledWidth = canvas.width * correctWidth * koef * scale.x;
          let scaledHeight = canvas.height * correctHeight * koef * scale.y;

          context.translate(x, y);
          context.rotate(angle);

          const canvasOffscreen = isEffect
            ? new OffscreenCanvas(image.width * repeatX, image.height * repeatY)
            : null;

          if (isEffect) {
            const contextOffscreen = canvasOffscreen.getContext('2d');
            const offset = Math.random() * image.height;

            contextOffscreen.translate(0, offset);
            contextOffscreen.fillStyle = contextOffscreen.createPattern(
              image,
              'repeat',
            );
            contextOffscreen.fillRect(
              0,
              0,
              canvasOffscreen.width,
              canvasOffscreen.height,
            );
            contextOffscreen.translate(0, -offset);
          }

          context.drawImage(
            isEffect ? canvasOffscreen : image,
            -scaledWidth * 0.5,
            -scaledHeight * 0.5,
            scaledWidth,
            scaledHeight,
          );

          context.rotate(-angle);
          context.translate(-x, -y);

          waitImagesCount--;

          if (!waitImagesCount) onDraw(context);
        };

        image.src = idTemplate;
      },
    );
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
