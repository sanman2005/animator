import * as React from 'react';
import TextTransition, { presets } from 'react-text-transition';

interface IAnimatedTextProps {
  className?: string;
  delay?: number;
  infinite?: boolean;
  texts: string[];
}

export default ({
  texts,
  className,
  delay = 3000,
  infinite = true,
}: IAnimatedTextProps) => {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    if (infinite || index < texts.length) {
      const intervalId = setInterval(
        () => setIndex(index < texts.length - 1 ? index + 1 : 0),
        delay,
      );

      return () => clearInterval(intervalId);
    }
  });

  return (
    <TextTransition
      className={className}
      springConfig={presets.default}
      text={texts[index]}
    />
  );
};
