import { ISpeech } from '../../types';

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
