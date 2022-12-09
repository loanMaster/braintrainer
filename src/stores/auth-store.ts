import { defineStore } from 'pinia';
import Userfront from '@userfront/core';
import { isTokenValid } from 'stores/token.utils';

export const useAuthStore = defineStore('auth', {
  getters: {
    accessToken() {
      return Userfront.tokens?.accessToken;
    },
    email() {
      return Userfront.user.email;
    },
  },
  actions: {
    async logout(options?: { redirect?: boolean }) {
      await Userfront.logout({ redirect: options?.redirect });
    },
    async login(options: {
      method?: string;
      uuid?: string;
      token?: string;
      emailOrUsername?: string;
      password?: string;
    }) {
      await Userfront.login(options as any);
    },
    redirectIfLoggedIn() {
      Userfront.redirectIfLoggedIn({});
    },
    async resetPassword(options: any) {
      await Userfront.resetPassword(options);
    },
    async sendResetLink(email: string) {
      await Userfront.sendResetLink(email);
    },
    async sentVerificationLink() {
      const payload = {
        email: Userfront.user.email,
        userId: Userfront.user.userId,
        tenantId: userFrontTenant,
      };
      await fetch('https://api.userfront.com/v0/auth/verify/link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    },
    async signup(options: {
      method: string;
      email?: string;
      password?: string;
      redirect?: boolean;
    }) {
      await Userfront.signup(options);
    },
    async refreshAccessToken() {
      try {
        await (Userfront.tokens as any).refresh();
      } catch (error) {
        // pass
      }
      if (!isTokenValid(Userfront.tokens.accessToken)) {
        await Userfront.logout({});
      }
    },
    async initUserFront() {
      await Userfront.init(userFrontTenant);
    },
  },
});
