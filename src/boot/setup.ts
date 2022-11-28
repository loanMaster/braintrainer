import { boot } from 'quasar/wrappers';
import { useAppStore } from 'stores/app-store';

export default boot(({ app }) => {
  app.config.errorHandler = (err) => {
    console.error(err);
    const lang = useAppStore().language;
    const msg =
      lang === 'de'
        ? 'Leider ist ein Fehler aufgetreten. Bitte Laden Sie die Seite neu oder versuchen Sie es später noch einmal.'
        : 'An error has occurred. Please refresh this site or try again later.';
    alert(msg);
  };
});
