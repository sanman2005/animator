import * as React from 'react';

import { ECorners } from './constants';

declare module '*.jpg' {
  const content: string;
  export = content;
}

interface IVector {
  x: number;
  y: number;
}

interface IElement {
  position: IVector;
  rotation: number;
  scale: IVector;
}

interface IEffect {
  animationSpeed: number;
  repeatX: number;
  repeatY: number;
}

interface ISpeech {
  corner: ECorners;
  size: number;
  text: string;
}

interface ISceneElement extends IElement, IEffect {
  category: string;
  content: React.ReactNode;
  id: string;
  image?: string;
  height: number;
  lastFrameIndex: number;
  speech?: ISpeech;
  templateId: string;
  width: number;
}

type TFrame = { [key: string]: ISceneElement };
