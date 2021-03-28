import { ISceneElement, ISpeech } from '../../types';

const getFontHeight = (font: string) => {
  const parent = document.createElement('span');

  parent.appendChild(document.createTextNode('height'));
  document.body.appendChild(parent);
  parent.style.cssText = `font: ${font}; white-space: nowrap; display: inline;`;

  const height = parent.offsetHeight;

  document.body.removeChild(parent);

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
  const words = text.split(' ');
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
  speech,
  width,
  x,
  y,
}: {
  context: CanvasRenderingContext2D;
  height: number;
  speech: ISpeech;
  width: number;
  x: number;
  y: number;
}) => {
  const radius = { tl: width, tr: width, br: width, bl: width };

  context.font = `${speech.size}px sans-serif`;
  context.fillStyle = 'white';
  context.strokeStyle = 'black';

  context.beginPath();
  context.moveTo(x + radius.tl, y);
  context.lineTo(x + width - radius.tr, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
  context.lineTo(x + width, y + height - radius.br);
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius.br,
    y + height,
  );
  context.lineTo(x + radius.bl, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
  context.lineTo(x, y + radius.tl);
  context.quadraticCurveTo(x, y, x + radius.tl, y);
  context.closePath();

  context.fill();
  context.stroke();

  drawText({ context, x, y, width, text: speech.text });
};

export const drawElement = (
  context: CanvasRenderingContext2D,
  {
    height,
    position,
    repeatX,
    repeatY,
    rotation,
    scale,
    speech,
    width,
  }: ISceneElement,
  img?: HTMLImageElement,
) => {
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
      height: scaledHeight,
      speech,
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
