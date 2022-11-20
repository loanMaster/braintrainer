import {QVueGlobals} from "quasar/dist/types/globals";

export const showLoadingIndicator = (q: QVueGlobals, delay = 300, group?: any) => {
  q.loading.show({ delay, group })
}

export const hideLoadingIndicator = (q: QVueGlobals, group?: any) => {
  q.loading.hide(group)
}
