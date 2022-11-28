import { useAppStore } from 'stores/app-store';

export const requestHelper = {
  getStandardRequestInit: (): RequestInit => {
    return {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-machine': useAppStore().machineId,
        'x-player': useAppStore().player.id,
      },
    };
  },
};
