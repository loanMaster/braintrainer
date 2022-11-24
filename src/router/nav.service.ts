import {useAppStore} from "stores/app-store";
import {router} from './index';

export interface NavRoute {
  name: string;
  nameOfTheGame?: string;
  difficulty?: string;
}

export class NavService {
  getPath (navRoute: NavRoute) {
    if (navRoute.name === 'play') {
      if (navRoute.nameOfTheGame && navRoute.difficulty) {
        return this.languagePrefix + navRoute.name + '/' + navRoute.difficulty + '/' + navRoute.nameOfTheGame
      }
    }
    if (navRoute.name === 'select-difficulty' && navRoute.nameOfTheGame) {
      return this.languagePrefix + 'play/select-difficulty/' + navRoute.nameOfTheGame
    }
    return this.removeTrailingSlash(this.languagePrefix + navRoute.name)
  }

  removeTrailingSlash (path: string) {
    return path.length > 1 && path.endsWith('/') ? path.substring(0, path.length - 1) : path
  }

  navigateTo (navRoute: NavRoute) {
    router.push(this.getPath(navRoute))
  }

  private get language (): string {
    return useAppStore().language as any
  }

  private get languagePrefix (): string {
    return this.language !== 'en' ? '/' + this.language + '/' : '/'
  }

}
