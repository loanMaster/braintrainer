export class PersistenceService {
  store (key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value))
  }

  fetch (key: string): any | undefined {
    if (localStorage.getItem(key)) {
      return JSON.parse(localStorage.getItem(key) as string)
    } else {
      return undefined
    }
  }
}
