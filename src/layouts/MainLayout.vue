<template>
  <q-layout view="hHh lpR fFf" class="column">
    <q-header elevated class="bg-primary">
      <q-toolbar class="justify-between">
        <div class="row">
          <q-btn
            dense
            flat
            round
            :icon="matMenu"
            @click="toggleLeftDrawer"
            class="mobile-only"
          />
          <q-toolbar-title class="non-selectable">
            <router-link
              :to="{ name: 'home', params: { language: store.language } }"
              class="text-white"
            >
              <q-avatar>
                <img src="/images/logo_small.png" />
              </q-avatar>
              <span class="xs-hide">{{ $t('APP_NAME') }}</span>
            </router-link>
          </q-toolbar-title>
        </div>

        <div
          class="desktop-only"
          style="
             {
              flex: 1 0 auto;
            }
          "
        >
          <router-link
            :to="{
              name: 'select-exercise',
              params: { language: store.language },
            }"
          >
            <q-btn
              flat
              dense
              no-wrap
              no-caps
              data-testid="practise-nav-item"
              :label="$t('Practise')"
              class="text-white q-px-sm"
            />
          </router-link>

          <router-link
            data-testid="player-scores-nav-item"
            :to="{
              name: 'player-scores',
              params: { language: store.language },
            }"
          >
            <q-btn
              flat
              dense
              no-wrap
              no-caps
              data-testid="progress-nav-item"
              :label="$t('Progress')"
              class="text-white q-px-sm"
            />
          </router-link>

          <router-link
            data-testid="user-settings-nav-item"
            :to="{
              name: 'user-settings',
              params: { language: store.language },
            }"
          >
            <q-btn
              flat
              dense
              no-wrap
              no-caps
              :label="$t('User profile')"
              class="text-white q-px-sm"
            />
          </router-link>
        </div>

        <div class="row no-wrap">
          <q-btn
            flat
            dense
            @click="$q.fullscreen.toggle()"
            data-testid="fullScreenToggle"
            :icon="$q.fullscreen.isActive ? matFullscreenExit : matFullscreen"
          />
          <q-toggle
            :modelValue="lightMode"
            data-testid="darkModeToggle"
            @update:modelValue="toggleDarkMode($event)"
            :checked-icon="matLightMode"
            color="secondary"
            :unchecked-icon="matDarkMode"
          />
          <q-btn
            flat
            round
            dense
            :icon="matLanguage"
            class="q-mr-xs"
            data-testid="languageDropdown"
          >
            <q-menu>
              <q-list dense style="min-width: 100px">
                <q-item
                  clickable
                  v-close-popup
                  @click="setLanguage('en')"
                  data-testid="select-language-en"
                >
                  <q-item-section>English</q-item-section>
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="setLanguage('de')"
                  data-testid="select-language-de"
                >
                  <q-item-section>deutsch</q-item-section>
                </q-item>
                <!-- <q-item clickable v-close-popup @click="setLanguage('es')">
                  <q-item-section>español</q-item-section>
                </q-item> -->
              </q-list>
            </q-menu>
          </q-btn>

          <q-btn flat round>
            <q-avatar>
              <img :src="profileImage" data-testid="profile-picture" />
            </q-avatar>
            <q-menu>
              <q-list dense>
                <q-item clickable v-close-popup>
                  <q-item-section class="column justify-center"
                    ><router-link
                      :to="{
                        name: 'user-settings',
                        params: { language: store.language },
                      }"
                      >{{ $t('User profile') }}</router-link
                    ></q-item-section
                  >
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer
      show-if-above
      v-model="leftDrawerOpen"
      side="left"
      bordered
      class="mobile-only"
    >
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-8">
          <q-item
            class="GNL__drawer-item"
            v-ripple
            v-for="link in links1"
            :key="link.text"
            clickable
          >
            <router-link
              class="row"
              :to="{ name: link.to, params: { language: store.language } }"
            >
              <q-item-section avatar>
                <q-icon :name="link.icon" />
              </q-item-section>
              <q-item-section>
                <q-item-label>{{ link.text }}</q-item-label>
              </q-item-section>
            </router-link>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container
      class="column flex-auto"
      style="max-width: 100vw; overflow-x: hidden"
    >
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import {
  matMenu,
  matLightMode,
  matDarkMode,
  matLanguage,
  matHome,
  matFitnessCenter,
  matBarChart,
  matPerson,
  matFullscreen,
  matFullscreenExit,
} from '@quasar/extras/material-icons';
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { setDarkMode } from 'src/util/dark-model.toggle';
import { useAuthStore } from 'stores/auth-store';
const leftDrawerOpen = ref(false);

const $q = useQuasar();
const store = useAppStore();
const { t } = useI18n();

onMounted(() => {
  leftDrawerOpen.value = false;
});

const lightMode = computed(() => {
  return !$q.dark.isActive;
});

function toggleDarkMode() {
  setDarkMode($q, !$q.dark.isActive);
  store.setThemePreference($q.dark.isActive ? 'dark' : 'light');
}

const i18n = useI18n();
const authStore = useAuthStore();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
function setLanguage(lang: string) {
  store.setLanguage(i18n, lang);
}

const profileImage = computed(() => authStore.image);

const links1 = ref([
  { icon: matHome, text: t('Home'), to: 'home' },
  { icon: matFitnessCenter, text: t('Practise'), to: 'select-exercise' },
  { icon: matBarChart, text: t('Progress'), to: 'player-scores' },
  { icon: matPerson, text: t('User profile'), to: 'user-settings' },
]);
</script>

<style scoped lang="scss">
a {
  text-decoration: none;
  color: unset;
}

.router-link-active button {
  text-decoration: underline;
  text-underline-color: white;
  text-decoration-width: 2px;
}
</style>
