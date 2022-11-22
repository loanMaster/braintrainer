<template>
  <router-view />
</template>

<script setup lang="ts">
import {useQuasar} from "quasar";
import {useAppStore} from "./stores/app-store";
import {SubscriptionCallbackMutation, SubscriptionCallbackMutationPatchObject} from "pinia";
import {useI18n} from "vue-i18n";

const $q = useQuasar()
const store = useAppStore()
const { t } = useI18n()
store.$subscribe((mutation: SubscriptionCallbackMutation<any>) => {
  if ((mutation as SubscriptionCallbackMutationPatchObject<any>).payload &&
    (mutation as SubscriptionCallbackMutationPatchObject<any>).payload.pause) {
    $q.dialog({
      message: '😴💤' + t('Application paused'),
      ok: 'X',
      persistent: true
    }).onOk(async () => {
      store.$patch({ pause: false })
    })
  }
})
</script>
