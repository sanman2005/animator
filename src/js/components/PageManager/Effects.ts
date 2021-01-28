export type TEffect = 'left' | 'right' | 'top' | 'bottom' | 'appear';

export const timeChangeSec = 0.7;

export const wrapperKey = {
  left: 'transform',
  right: 'transform',
  top: 'transform',
  bottom: 'transform',
  appear: 'opacity',
};

export const wrapperBegin = {
  left: '',
  right: '',
  top: '',
  bottom: '',
  appear: 1,
};

export const wrapperEnd = {
  left: 'translateX(100vw)',
  right: 'translateX(-100vw)',
  top: 'translateY(100vw)',
  bottom: 'translateY(-100vw)',
  appear: 1,
};

export const pageKey = {
  left: 'left',
  right: 'left',
  top: 'top',
  bottom: 'top',
  appear: 'opacity',
};

export const pageBegin = {
  left: '-100%',
  right: '100%',
  top: '-100%',
  bottom: '100%',
  appear: 0,
};

export const pageEnd = {
  left: '-100%',
  right: '100%',
  top: '-100%',
  bottom: '100%',
  appear: 1,
};

export const pagePrevKey = {
  left: '',
  right: '',
  top: '',
  bottom: '',
  appear: 'opacity',
  disappear: 'opacity',
};

export const pagePrevBegin = {
  left: '',
  right: '',
  top: '',
  bottom: '',
  appear: 1,
};

export const pagePrevEnd = {
  left: '',
  right: '',
  top: '',
  bottom: '',
  appear: 0,
};

export const inverse: { [key: string]: TEffect } = {
  left: 'right',
  right: 'left',
  top: 'bottom',
  bottom: 'top',
  appear: 'appear',
};

export const pageStyles = {
  position: 'absolute',
  zIndex: 1,
  top: 0,
  left: 0,
};

const transition = `${timeChangeSec}s`;

export const getStyles = (effect: TEffect, pageHeight: number, pagePrevHeight: number) => ({
  begin: {
    wrapper: {
      [wrapperKey[effect]]: wrapperBegin[effect],
    },
    page: {
      ...pageStyles,
      [pageKey[effect]]: pageBegin[effect],
    },
    pagePrev: {
      [pagePrevKey[effect]]: pagePrevBegin[effect],
      height: `${pagePrevHeight}px`,
    },
  },
  end: {
    wrapper: {
      transition,
      [wrapperKey[effect]]: wrapperEnd[effect],
    },
    page: {
      ...pageStyles,
      transition,
      [pageKey[effect]]: pageEnd[effect],
    },
    pagePrev: {
      transition,
      [pagePrevKey[effect]]: pagePrevEnd[effect],
      height: `${pageHeight}px`,
    },
  },
});
