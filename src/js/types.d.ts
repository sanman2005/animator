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
  animationSpeed: number;
  repeatX: number;
  repeatY: number;
}

interface ISpeech {
  text: string;
}

interface ISceneElement extends IElement, IEffect, ISpeech {
  category: string;
  content: React.ReactNode;
  id: string;
  image: string;
  height: number;
  width: number;
}
