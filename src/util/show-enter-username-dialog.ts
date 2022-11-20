import {QVueGlobals} from "quasar/dist/types/globals";
import {ComposerTranslation} from "vue-i18n";

export async function showEnterUsernameDialog($q: QVueGlobals, t: ComposerTranslation): Promise<string | undefined> {
  return new Promise(resolve => {
    $q.dialog({
      title: t('What\'s your name?'),
      prompt: {
        model: '',
        isValid: val => val.length > 3 && val.length < 20,
        type: 'text'
      },
      cancel: true,
      persistent: true
    }).onOk(data => {
      resolve(data);
    }).onCancel(() => {
      resolve(undefined);
    }).onDismiss(() => {
      resolve(undefined);
    })
  })
}
