import * as React from 'react';

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
  repeatX: number;
  repeatY: number;
}

interface ISceneElement extends IElement, IEffect {
  category: string;
  content: React.ReactNode;
  id: string;
  idTemplate: string;
  height: number;
  width: number;
}
