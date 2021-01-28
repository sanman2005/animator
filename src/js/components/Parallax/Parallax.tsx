import * as React from 'react';
import { Parallax } from 'react-parallax';

interface IParallaxProps {
  bgImage: string;
  children: React.ReactNode;
  className?: string;
}

export default ({ bgImage, children, className }: IParallaxProps) => (
  <Parallax
    bgImage={bgImage}
    contentClassName={className}
    strength={200}
    className='parallax'
    renderLayer={(percentage: number) => (
      <div
        style={{
          position: 'absolute',
          background: `rgba(0, 0, 0, ${percentage * 0.5})`,
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
        }}
      />
    )}
  >
    {children}
  </Parallax>
);
