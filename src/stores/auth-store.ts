import { defineStore } from 'pinia';
import Userfront from '@userfront/core';
import { isTokenValid } from 'stores/token.utils';

export interface IAuth {
  id: string | undefined;
  name: string | undefined;
  image: string | undefined;
  _hasAccount: boolean;
}

export const useAuthStore = defineStore('auth', {
  state: (): IAuth => {
    return {
      id: undefined,
      name: undefined,
      image: undefined,
      _hasAccount: !!localStorage.getItem('hasAccount'),
    };
  },
  getters: {
    accessToken(): string {
      return Userfront.tokens?.accessToken;
    },
    email(): string {
      return Userfront.user.email!;
    },
    isLoggedIn(): boolean {
      return (
        !!Userfront.tokens.accessToken &&
        isTokenValid(Userfront.tokens.accessToken)
      );
    },
    isConfirmed(): boolean {
      return !!Userfront.user?.isConfirmed;
    },
    hasAccount(): boolean {
      return this._hasAccount;
    },
  },
  actions: {
    updateUserInfo() {
      this.id = String(Userfront.user?.userId as number);
      this.name = Userfront.user.name;
      this.image =
        ((Userfront.user?.data as any)?.image as string) ||
        '/images/avatars/default_avatar.png';
    },
    async update(name: string, image: string): Promise<void> {
      await Userfront.user.update!({ name, data: { image } });
      this.updateUserInfo();
    },
    async logout(options?: { redirect?: boolean }) {
      await Userfront.logout({ redirect: options?.redirect });
      this.updateUserInfo();
    },
    async login(options: {
      method?: string;
      uuid?: string;
      token?: string;
      emailOrUsername?: string;
      password?: string;
    }) {
      await Userfront.login(options as any);
      if (!this._hasAccount) {
        this._hasAccount = true;
        localStorage.setItem('hasAccount', String(true));
      }
      this.updateUserInfo();
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
      image?: string;
      username?: string;
      password?: string;
      redirect?: boolean;
    }) {
      await Userfront.signup(options);
      if (!this._hasAccount) {
        this._hasAccount = true;
        localStorage.setItem('hasAccount', String(true));
      }
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
      this.updateUserInfo();
    },
  },
});
