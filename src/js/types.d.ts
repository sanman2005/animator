declare module 'serviceworker-webpack-plugin/lib/runtime' {
  function register(): Promise<ServiceWorkerRegistration>;
}

declare const serviceWorkerOption: {
  assets: string[];
}

declare module '*.jpg' {
  const content: string;
  export = content;
}

declare module 'react-text-transition' {
  import * as React from 'react';

  const textTransition: React.FC<{ className?: string; springConfig: any; text: string }>;
  export const presets: any;
  export default textTransition;
}

declare interface IVector {
  x: number;
  y: number;
}
