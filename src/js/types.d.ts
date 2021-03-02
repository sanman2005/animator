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

interface ISceneElement extends IElement {
  id: string;
  idTemplate: string;
  content: React.ReactNode;
  height: number;
  width: number;
}
