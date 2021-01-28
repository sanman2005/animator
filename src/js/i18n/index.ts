import { capitalize, isClient } from 'js/helpers';
import * as langs from './translations';

type TLang = { [key: string]: string };
type TLangs = { [key: string]: TLang };

const defaultLang = 'en';
let currentLang = (isClient && localStorage.getItem('lang')) || defaultLang;
const onLangUpdateListeners: (() => void)[] = [];

export const getLang = () => currentLang;
export const getLangs = () => Object.keys(langs);
export const setLang = (lang: string) => {
  if ((langs as TLangs)[lang]) {
    currentLang = lang;
    onLangUpdateListeners.forEach(listener => listener());
    localStorage.setItem('lang', lang);
  }
};

export const nextLang = () => {
  const keys = getLangs();

  setLang(keys[keys.indexOf(currentLang) + 1] || keys[0]);
};

export const addLangUpdateListener = (listener: () => void) =>
  onLangUpdateListeners.push(listener);

export const removeLangUpdateListener = (listener: () => void) =>
  onLangUpdateListeners.splice(onLangUpdateListeners.indexOf(listener), 1);

export default (keys: TemplateStringsArray) =>
  capitalize(
    keys
      .map(key =>
        key
          .split(/\b/)
          .map(
            word =>
              (langs as TLangs)[currentLang][word] ||
              (langs as TLangs)[defaultLang][word] ||
              word,
          )
          .join(' '),
      )
      .join(' '),
  );
