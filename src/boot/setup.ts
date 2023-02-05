import { boot } from 'quasar/wrappers';

export default boot(async () => {
  (window as any).serverPath = process.env.serverPath;
  (window as any).dev = process.env.dev;
});
