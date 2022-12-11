import en from './en';
import de from './de';
import es from './es';
Object.keys(en).forEach(key => {
  if (en[key as keyof typeof en] === '_') {
    en[key as keyof typeof en] = key as any
  }
})
export default {
  en,
  de,
  es,
};
