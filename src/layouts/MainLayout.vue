<template>
  <q-layout view="hHh lpR fFf" class="column">
    <q-header elevated class="bg-primary text-white ">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="non-selectable">
          <q-avatar>
            <q-icon name="psychology" size="2rem"/>
          </q-avatar>
          Braintrainer
        </q-toolbar-title>
        <q-space class="desktop-only"/>

        <q-btn flat dense no-wrap no-caps :label="$t('Play')" :to="`${langPrefix}/play`" class="q-ml-sm q-px-md desktop-only"/>
        <q-btn flat dense no-wrap no-caps :label="$t('Your Scores')" :to="`${langPrefix}/player-scores`" class="q-ml-sm q-px-md desktop-only"/>
        <q-btn flat dense no-wrap no-caps :label="$t('Documentation')" :to="`${langPrefix}/documentation`" class="q-ml-sm q-px-md desktop-only"/>
        <q-btn flat dense no-wrap no-caps :label="$t('Highscores')" :to="`${langPrefix}/highscores`" class="q-ml-sm q-px-md desktop-only"/>
        <q-space class="desktop-only"/>
        <div>
          <q-btn flat round dense icon="language" class="q-mr-xs" />
          <q-menu>
            <q-list dense style="min-width: 100px">
              <q-item clickable v-close-popup @click="setLanguage('en')">
                <q-item-section>English</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setLanguage('de')">
                <q-item-section>deutsch</q-item-section>
              </q-item>
              <q-item clickable v-close-popup @click="setLanguage('es')">
                <q-item-section>español</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
        <q-btn flat round dense icon="group_add" />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-8">
          <q-item class="GNL__drawer-item" v-ripple v-for="link in links1" :key="link.text" clickable>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-sm" />

          <q-item class="GNL__drawer-item" v-ripple v-for="link in links2" :key="link.text" clickable>
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container class="column flex-auto">
      <router-view v-slot="{ Component }">
        <transition mode="out-in"
          leave-active-class="animated fadeOut"
          enter-active-class="animated fadeIn"
          appear
          :duration="{ leave: 300, enter: 300 }"
        >
          <component :is="Component" />
        </transition>
      </router-view>
    </q-page-container>

  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {useAppStore} from "stores/app-store";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
const leftDrawerOpen = ref(false)

onMounted(() => {
  leftDrawerOpen.value = false
})

const route = useRoute()
const i18n = useI18n();
function toggleLeftDrawer () {
  leftDrawerOpen.value = !leftDrawerOpen.value
}
function setLanguage(lang: string) {
  useAppStore().setLanguage(i18n, lang)
}

const langPrefix = computed(() =>  {
  return useAppStore().language === 'en' ? '' : '/' + useAppStore().language
})

const links1 = ref([
  { icon: 'web', text: 'Top stories' },
  { icon: 'person', text: 'For you' },
  { icon: 'star_border', text: 'Favourites' },
  { icon: 'search', text: 'Saved searches' }
])

const links2 = ref([
  { icon: 'flag', text: 'Canada' },
  { icon: 'place', text: 'Local' },
  { icon: 'domain', text: 'Business' },
  { icon: 'memory', text: 'Technology' },
  { icon: 'local_movies', text: 'Entertainment' },
  { icon: 'directions_bike', text: 'Sports' },
  { icon: 'fitness_center', text: 'Health ' }
])
</script>
