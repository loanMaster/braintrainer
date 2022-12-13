<template>
  <router-view />
</template>

<script setup lang="ts">
import { useAppStore } from './stores/app-store';
import { useI18n } from 'vue-i18n';
import { onBeforeMount, onMounted } from 'vue';
import { NavigationGuardNext, useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { SoundService } from 'src/shared-services/sound.service';

const store = useAppStore();
const i18n = useI18n();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

onBeforeMount(() => {
  $q.dark.set(store.themePreference === 'dark');
});

onMounted(() => {
  new SoundService().preCacheSounds();
});

const removeTrailingSlash = (path: string) => {
  return path.length > 1 && path.endsWith('/')
    ? path.substring(0, path.length - 1)
    : path;
};

let initialPageLoad = true;
router.beforeEach(async (to, from, next: NavigationGuardNext) => {
  const language = to.params.language || 'en';
  if (initialPageLoad) {
    initialPageLoad = false;
    if (language === 'en' && useAppStore().language !== language) {
      next(removeTrailingSlash(`/${useAppStore().language}${to.fullPath}`));
      return;
    }
  }
  next();
  if (useAppStore().language !== language) {
    setTimeout(() => {
      useAppStore().setLanguage(i18n, language as string);
    }); // TODO find better solution
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
      if (!language || store.language !== language) {
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
