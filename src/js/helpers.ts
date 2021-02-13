import * as React from 'react';

import 'js/types.d.ts';

export const env = process.env.NODE_ENV || 'production';
export const isDev = process.env.NODE_ENV === 'local';
export const isTest = process.env.APP_MODE === 'test';
export const isClient = typeof document !== 'undefined';

const mobileWidth = 768;

export const emailPattern = '^.+?@.+?\\..+$';
export const namePattern = '^[\\sA-Za-zА-Яа-яЁё-]+$';
export const passwordPattern = '^[^\\/"`\']+$';
export const phonePattern = '(\\+7 \\(\\d{3}\\)\\s\\d{3}-\\d{2}-\\d{2}|\\d{11})';

export const randomFloat = (max: number, min = 0) => min + Math.random() * (max - min);

export const random = (max: number, min = 0) => Math.floor(randomFloat(min, max));

export const getElementOffsetTop = (element: Element): number => {
  let offset = 0;
  let node: any = element;

  do {
    offset += node.offsetTop || 0;
    node = node.offsetParent;
  } while (node);

  return offset;
};

export const getElementOffsetLeft = (element: Element): number => {
  let offset = 0;
  let node: any = element;

  do {
    offset += node.offsetLeft || 0;
    node = node.offsetParent;
  } while (node);

  return offset;
};

export const isDesktop = () => isClient && window.innerWidth > mobileWidth;

export const formatNumWithLeadZero = (num: number): string =>
  num >= 0 && num < 10 ? `0${num}` : `${num}`;

export const clearNumber = (phone: string) => phone.replace(/\D/g, '');
export const clearField = (field: string) => field.replace(/[\\/"'`]/g, '');

export const geCountWord = (count: number, words: string[]) => {
  const remainder = count % 10;

  if (remainder === 1) {
    return words[0];
  }

  if (remainder > 1 && remainder < 5 && (count < 10 || count > 20)) {
    return words[1];
  }

  return words[2];
};

export const getMousePosition = (event: React.MouseEvent<HTMLDivElement>) => ({
  x: event.pageX,
  y: event.pageY,
});

export const vectorMulti = (a: IVector, b: number): IVector => ({
  x: a.x * b,
  y: a.y * b,
});

export const vectorsPlus = (a: IVector, b: IVector): IVector => ({
  x: a.x + b.x,
  y: a.y + b.y,
});

export const vectorsMinus = (a: IVector, b: IVector): IVector => ({
  x: a.x - b.x,
  y: a.y - b.y,
});

export const media = {
  small: `(max-width: ${mobileWidth}px)`,
  pc: '(max-width: 1024px)',
  medium: '(max-width: 1280px)',
};

let windowScrollY = 0;

export const scrollEnable = () => {
  document.body.classList.remove('fixed');
  window.scrollTo({ left: 0, top: windowScrollY });
};

export const scrollDisable = () => {
  windowScrollY = window.scrollY;
  document.body.classList.add('fixed');
};

export const scrollTo = (top = 0) => window.scrollTo({
  top,
  behavior: 'smooth',
});

export const scrollToBottom = () => scrollTo(document.body.getBoundingClientRect().height);

export const getMonthName = (month: number, padezh: number = 1) => ([
  ['Январь', 'Января'],
  ['Февраль', 'Февраля'],
  ['Март', 'Марта'],
  ['Апрель', 'Апреля'],
  ['Май', 'Мая'],
  ['Июнь', 'Июня'],
  ['Июль', 'Июля'],
  ['Август', 'Августа'],
  ['Сентябрь', 'Сентября'],
  ['Октябрь', 'Октября'],
  ['Ноябрь', 'Ноября'],
  ['Декабрь', 'Декабря'],
])[month - 1][padezh - 1];

export const capitalize = (text: string) => text[0].toUpperCase() + text.slice(1);
