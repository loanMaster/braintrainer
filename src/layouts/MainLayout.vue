<template>
  <q-layout view="hHh lpR fFf" class="column">
    <q-header elevated class="bg-primary">
      <q-toolbar class="justify-between">
        <div class="row">
          <q-btn
            dense
            flat
            round
            icon="menu"
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
              {{ $t('APP_NAME') }}
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
              :label="$t('Practise')"
              class="text-white q-px-sm"
            />
          </router-link>

          <router-link
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
              :label="$t('Progress')"
              class="text-white q-px-sm"
            />
          </router-link>

          <router-link
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
        </div>

        <div class="row no-wrap">
          <q-btn
            flat
            dense
            @click="$q.fullscreen.toggle()"
            :icon="$q.fullscreen.isActive ? 'fullscreen_exit' : 'fullscreen'"
          />
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
                <q-item
                  clickable
                  v-close-popup
                  @click="logout"
                  v-if="isLoggedIn"
                >
                  <q-item-section>{{ $t('Logout') }}</q-item-section>
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
  { icon: 'home', text: 'Startseite', to: 'home' },
  { icon: 'fitness_center', text: 'Üben', to: 'select-exercise' },
  { icon: 'bar_chart', text: 'Fortschritt', to: 'player-scores' },
  { icon: 'person', text: 'Benutzerprofil', to: 'user-settings' },
  { icon: 'emoji_events', text: 'Highscores', to: 'highscores' },
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
