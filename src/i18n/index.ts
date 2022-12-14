import en from './en';
import de from './de';
import es from './es';

const replacePlaceHolderRecursive = (key: string, value: any) => {
  const current = value[key];
  if (current === '_') {
    value[key] = key as any;
  } else if (typeof current === 'object') {
    Object.keys(current).forEach((tempKey) =>
      replacePlaceHolderRecursive(tempKey, current)
    );
  }
};

Object.keys(en).forEach((key) => replacePlaceHolderRecursive(key, en));

export default {
  en,
  de,
  es,
};
