import { useAppStore } from 'stores/app-store';
import {requestHelper} from "src/shared-services/request.helper";

export class AccountService {
  private get store() {
    return useAppStore();
  }

  get serverPath() {
    return serverPath || '';
  }

  async deleteAccount(): Promise<void> {
    const response = await fetch(this.serverPath + '/player/account', {
      ...requestHelper.getStandardRequestInit(),
      method: 'DELETE'
    });
    return response.json();
  }
}
