import { boot } from 'quasar/wrappers';
import { useAuthStore } from 'stores/auth-store';

export default boot(async () => {
  (window as any).userFrontTenant = '6bg6ggwn';
  (window as any).serverPath = process.env.serverPath;
  await useAuthStore().initUserFront();
});
