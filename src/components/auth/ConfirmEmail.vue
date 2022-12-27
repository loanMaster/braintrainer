<template>
  <LoadingIndicator :showing="true" />
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import { useQuasar } from 'quasar';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';

const $q = useQuasar();
const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();

onBeforeMount(async () => {
  if (route.query.uuid && route.query.token) {
    // clear all cookies and reload due to firefox bug.
    if (document.cookie) {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        location.reload();
      });
    }
    try {
      await authStore.login({
        method: 'link',
        uuid: route.query.uuid as string,
        token: route.query.token as string,
        redirect: false,
      });
      router.push({
        name: 'user-settings',
        params: { language: useAppStore().language },
      });
    } catch (error) {
      $q.notify({
        message: t("auth['There was an error during login.']"),
        color: 'red',
        timeout: 30000,
      });
      router.push({
        name: 'verification-pending',
        params: { language: useAppStore().language },
      });
    }
  } else {
    router.push({ name: 'home', params: { language: useAppStore().language } });
  }
});
</script>

<style scoped lang="scss">
.gap {
  gap: 5px;
}
</style>
