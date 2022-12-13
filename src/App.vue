<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAppStore } from './stores/app-store';
import { useI18n } from 'vue-i18n';
import {getCurrentScope, inject, onBeforeMount, onMounted } from 'vue';
import {NavigationGuardNext, RouteLocationNormalized, useRoute, useRouter} from 'vue-router';
import { useQuasar } from 'quasar';
import { SoundService } from 'src/shared-services/sound.service';
import { getCurrentInstance } from 'vue'

const store = useAppStore();
const i18n = useI18n();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const { t } = useI18n()

onBeforeMount(() => {
  $q.dark.set(store.themePreference === 'dark');
  getCurrentInstance()!.appContext.app.config.errorHandler = (err) => {
    console.error(err);
    $q.dialog({
      persistent: true,
      message: t('An error has occurred. Please refresh this site or try again later.')
    }).onOk(() => location.reload())
  };
});

onMounted(() => {
  new SoundService().preCacheSounds();
});

const removeTrailingSlash = (path: string) => {
  return path.length > 1 && path.endsWith('/')
    ? path.substring(0, path.length - 1)
    : path;
};

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  const language = to.params.language;
  if (!language) {
    next({ name: to.name as string, params: { ...to.params, language: language || store.language }})
  } else {
    if (language && useAppStore().language !== language) {
      useAppStore().setLanguage(i18n, language as string);
    }
    next();
  }
});

router.beforeEach((to, from, next) => {
  if (to !== from) {
    $q.loading.show({
      delay: 400 // ms
    })
  }
  next()
})

router.afterEach((to, from) => {
  $q.loading.hide()
})

store.$onAction(({ name, after }) => {
  after(() => {
    if (name == 'setLanguage') {
      const language = route.params.language;
      if (store.language !== language) {
        const withoutLangPath = (router.currentRoute.value.fullPath + '/')
          .replaceAll('//', '')
          .replace(`/${language}/`, '/');
        router.push(removeTrailingSlash(`/${store.language}${withoutLangPath}`));
      }
    }

    if (name === 'pause' && store.isPaused) {
      $q.dialog({
        message: '😴💤' + i18n.t('Application paused'),
        ok: 'X',
        persistent: true,
      }).onOk(() => {
        store.resume();
      });
    }
  });
});
</script>
