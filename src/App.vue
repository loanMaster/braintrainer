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
store.$onAction(({ name, after }) => {
  after(() => {
    if (name === 'pause' && store.isPaused) {
      $q.dialog({
        message: '😴💤' + t('Application paused'),
        ok: 'X',
        persistent: true
      }).onOk(() => {
        store.resume()
      })
    }
  })
})
</script>
