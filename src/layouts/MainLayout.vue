<template>
  <q-layout view="hHh lpR fFf" class="column">
    <q-header elevated class="bg-primary">
      <q-toolbar>
        <q-btn dense flat round icon="menu" @click="toggleLeftDrawer" />
        <q-toolbar-title class="non-selectable">
          <q-avatar>
            <img src="/images/logo_small.png" />
          </q-avatar>
          Braintrainer
        </q-toolbar-title>
        <q-space class="desktop-only" />

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
            :label="$t('Play')"
            class="text-white q-px-sm"
          />
        </router-link>

        <router-link
          :to="{ name: 'player-scores', params: { language: store.language } }"
        >
          <q-btn
            flat
            dense
            no-wrap
            no-caps
            :label="$t('Your Scores')"
            class="text-white q-px-sm"
          />
        </router-link>

        <router-link
          :to="{ name: 'documentation', params: { language: store.language } }"
        >
          <q-btn
            flat
            dense
            no-wrap
            no-caps
            :label="$t('Documentation')"
            class="text-white q-px-sm"
          />
        </router-link>

        <router-link
          :to="{ name: 'highscores', params: { language: store.language } }"
        >
          <q-btn
            flat
            dense
            no-wrap
            no-caps
            :label="$t('Highscores')"
            class="text-white q-px-sm"
          />
        </router-link>

        <q-space class="desktop-only" />
        <div>
          <q-toggle
            :modelValue="lightMode"
            @update:modelValue="toggleDarkMode($event)"
            checked-icon="light_mode"
            color="secondary"
            unchecked-icon="dark_mode"
          />
          <q-btn flat round dense icon="language" class="q-mr-xs">
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
          </q-btn>

          <q-btn flat round>
            <q-avatar @click="login">
              <img :src="profileImage" />
            </q-avatar>
            <q-menu>
              <q-list dense>
                <q-item clickable v-close-popup v-if="isLoggedIn">
                  <q-item-section
                    ><router-link
                      :to="{
                        name: 'user-settings',
                        params: { language: store.language },
                      }"
                      >Settings</router-link
                    ></q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  v-close-popup
                  @click="logout"
                  v-if="isLoggedIn"
                >
                  <q-item-section>Logout</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" side="left" bordered>
      <q-scroll-area class="fit">
        <q-list padding class="text-grey-8">
          <q-item
            class="GNL__drawer-item"
            v-ripple
            v-for="link in links1"
            :key="link.text"
            clickable
          >
            <q-item-section avatar>
              <q-icon :name="link.icon" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ link.text }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-separator inset class="q-my-sm" />

          <q-item
            class="GNL__drawer-item"
            v-ripple
            v-for="link in links2"
            :key="link.text"
            clickable
          >
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
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { setDarkMode } from 'src/util/dark-model.toggle';
import { useAuthStore } from 'stores/auth-store';
import { useRouter } from 'vue-router';
const leftDrawerOpen = ref(false);

const $q = useQuasar();
const store = useAppStore();

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
const router = useRouter();

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}
function setLanguage(lang: string) {
  store.setLanguage(i18n, lang);
}

const isLoggedIn = computed(() => {
  return authStore.isLoggedIn;
});

function logout() {
  authStore.logout();
}

function login() {
  if (!authStore.isLoggedIn) {
    router.push({ name: 'login', params: { language: store.language } });
  }
}

const profileImage = computed(() => authStore.image);

const links1 = ref([
  { icon: 'web', text: 'Top stories' },
  { icon: 'person', text: 'For you' },
  { icon: 'star_border', text: 'Favourites' },
  { icon: 'search', text: 'Saved searches' },
]);

const links2 = ref([
  { icon: 'flag', text: 'Canada' },
  { icon: 'place', text: 'Local' },
  { icon: 'domain', text: 'Business' },
  { icon: 'memory', text: 'Technology' },
  { icon: 'local_movies', text: 'Entertainment' },
  { icon: 'directions_bike', text: 'Sports' },
  { icon: 'fitness_center', text: 'Health ' },
]);
</script>

<style scoped lang="scss">
a {
  text-decoration: none;
}

.router-link-active button {
  text-decoration: underline;
  text-underline-color: white;
  text-decoration-width: 2px;
}
</style>
