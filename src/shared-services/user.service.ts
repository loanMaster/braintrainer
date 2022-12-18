import { useAppStore } from 'stores/app-store';
import { requestHelper } from 'src/shared-services/request.helper';

export class UserService {
  private get store() {
    return useAppStore();
  }

  get serverPath() {
    return serverPath || '';
  }

  async deleteAccount(): Promise<void> {
    const response = await fetch(this.serverPath + '/player/account', {
      ...requestHelper.getStandardRequestInit(),
      method: 'DELETE',
    });
    return response.json();
  }

  activate(id: number, email: string): Promise<any> {
    return fetch(this.serverPath + '/user', {
      ...requestHelper.getStandardRequestInit(),
      method: 'POST',
      body: JSON.stringify({ id, email, lang: this.store.language })
    });
  }
}
