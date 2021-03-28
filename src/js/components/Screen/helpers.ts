import { ISceneElement } from '../../types';
import { ECorners } from 'js/constants';

const fontsHeight: { [key: string]: number } = {};

const getFontHeight = (font: string) => {
  if (fontsHeight[font]) return fontsHeight[font];

  const parent = document.createElement('span');

  parent.appendChild(document.createTextNode('height'));
  document.body.appendChild(parent);
  parent.style.cssText = `font: ${font}; white-space: nowrap; display: inline;`;

  const height = parent.offsetHeight;

  document.body.removeChild(parent);

  fontsHeight[font] = height;

  return height;
};

const drawText = ({
  context,
  text,
  width,
  x,
  y,
}: {
  context: CanvasRenderingContext2D;
  text: string;
  width: number;
  x: number;
  y: number;
}) => {
  const lineHeight = getFontHeight(context.font);
  const words = text.split(/[ \u8629↵\r\n]/);
  let line = '';
  let top = y;

  words.forEach(word => {
    const testLine = `${line}${word} `;
    const testWidth = context.measureText(testLine).width;

    if (testWidth > width) {
      context.fillText(line, x, top);
      line = `${word} `;
      top += lineHeight;
    } else {
      line = testLine;
    }
  });

  context.fillText(line, x, top);
};

export const drawSpeech = ({
  context,
  height,
  element,
  width,
  x,
  y,
}: {
  context: CanvasRenderingContext2D;
  height: number;
  element: ISceneElement;
  width: number;
  x: number;
  y: number;
}) => {
  const { scale, speech } = element;
  const { corner } = speech;
  const radius = width / 3;
  const radiusLeftTop = corner === ECorners.leftTop ? 0 : radius;
  const radiusLeftBottom = corner === ECorners.leftBottom ? 0 : radius;
  const radiusRightTop = corner === ECorners.rightTop ? 0 : radius;
  const radiusRightBottom = corner === ECorners.rightBottom ? 0 : radius;

  context.font = `${speech.size * scale.x}px sans-serif`;
  context.fillStyle = 'white';
  context.lineWidth = 2;

  context.beginPath();

  context.moveTo(x + radiusLeftTop, y);
  context.lineTo(x + width - radiusRightTop, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radiusRightTop);
  context.lineTo(x + width, y + height - radiusRightBottom);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radiusRightBottom,
    y + height,
  );
  context.lineTo(x + radiusLeftBottom, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radiusLeftBottom);
  context.lineTo(x, y + radiusLeftTop);
  context.quadraticCurveTo(x, y, x + radiusLeftTop, y);

  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = 'black';
  context.lineWidth = 1;

  const textPadding = width * 0.1;

  drawText({
    context,
    x: x + textPadding,
    y: y + textPadding,
    width: width - textPadding * 2,
    text: speech.text,
  });
};

export const drawElement = (
  context: CanvasRenderingContext2D,
  element: ISceneElement,
  img?: HTMLImageElement,
) => {
  const {
    height,
    position,
    repeatX,
    repeatY,
    rotation,
    scale,
    speech,
    width,
  } = element;
  const isEffect = repeatX !== 1 || repeatY !== 1;
  const isSpeech = speech?.text;
  const koef = 0.01;
  const x = context.canvas.width * (0.5 + width * position.x * koef * koef);
  const y = context.canvas.height * (0.5 + height * position.y * koef * koef);
  const angle = (Math.PI / 180) * rotation;

  let correctWidth = width;
  let correctHeight = height;

  if (img) {
    const { naturalHeight, naturalWidth } = img;
    const ratio = naturalWidth / naturalHeight;
    const canvasRatio = context.canvas.width / context.canvas.height;

    correctWidth *= ratio >= canvasRatio ? 1 : 1 / canvasRatio;
    correctHeight *= ratio < canvasRatio ? 1 : canvasRatio;
  }

  const scaledWidth = context.canvas.width * correctWidth * koef * scale.x;
  const scaledHeight = context.canvas.height * correctHeight * koef * scale.y;

  context.translate(x, y);
  context.rotate(angle);

  let source: HTMLImageElement | OffscreenCanvas = img;

  if (isEffect) {
    source = new OffscreenCanvas(img.width * repeatX, img.height * repeatY);

    const sourceCtx = source.getContext('2d');
    const offset = Math.random() * img.height;

    sourceCtx.translate(0, offset);
    sourceCtx.fillStyle = sourceCtx.createPattern(img, 'repeat');
    sourceCtx.fillRect(0, 0, source.width, source.height);
    sourceCtx.translate(0, -offset);
  }

  if (isSpeech) {
    drawSpeech({
      context,
      element,
      height: scaledHeight,
      width: scaledWidth,
      x: -scaledWidth * 0.5,
      y: -scaledHeight * 0.5,
    });
  } else {
    context.drawImage(
      source,
      -scaledWidth * 0.5,
      -scaledHeight * 0.5,
      scaledWidth,
      scaledHeight,
    );
  }

  context.rotate(-angle);
  context.translate(-x, -y);
};

export const prepareElementImage = (element: ISceneElement) =>
  new Promise<HTMLImageElement>(resolve => {
    const isSpeech = element.speech?.text;

    if (isSpeech) return resolve(null);

    const img = new Image();

    img.onload = () => resolve(img);
    img.src = element.image;
  });
