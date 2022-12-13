import { useAppStore } from 'stores/app-store';
import { useAuthStore } from 'stores/auth-store';

export const requestHelper = {
  getStandardRequestInit: (): RequestInit => {
    return {
      mode: 'cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'x-machine': useAppStore().machineId,
        'x-player': useAuthStore().id || '',
        Authorization: `Bearer ${useAuthStore().accessToken}`,
      },
    };
  },
};
