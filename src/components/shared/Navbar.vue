<template>
  <nav class="c-nav navbar navbar-expand-lg navbar-light bg-light c-shadow">
    <div class="container-fluid">
      <div
        class="g-desktop-hidden d-flex justify-content-start g-flex-1 user-select-none" @click="navigateTo({ name: '' })">
        <img src="/favicon.ico" style="margin-right: 6px; height: 2rem;"/>
        <span class="d-flex align-items-center fw-bold g-mr-2 g-portrait-hidden">BrainTrainer</span>
      </div>
      <span v-if="playerName" class="g-desktop-hidden g-mr-2">{{ playerName }}</span>
      <FullScreenToggle class="g-mr-2 g-desktop-hidden"/>
      <button class="navbar-toggler c-navbar-toggler" type="button" @click="collapsedMenu = !collapsedMenu">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div
        class="collapse navbar-collapse show c-navbar"
        :class="collapsedMenu ? '' : 'c-expand'"
      >
        <img src="/favicon.ico" style="height: 2rem;" class="g-mobile-hidden g-cursor-pointer user-select-none" @click="navigateTo({ name: '' })"/>
        <span class="fw-bold g-mobile-hidden d-flex align-items-center g-cursor-pointer user-select-none" @click="navigateTo({ name: '' })">BrainTrainer</span>
        <ul
          class="navbar-nav me-auto mb-2-s mb-lg-0 g-ml-2 my-flex-align-center"
        >
          <li class="nav-item">
            <AppRouterLink class="nav-link active" to="">{{ $t('Play') }}</AppRouterLink>
          </li>
          <li class="nav-item">
            <AppRouterLink to="documentation">{{ $t('Documentation') }}</AppRouterLink>
          </li>
          <li class="nav-item">
            <AppRouterLink class="nav-link active" to="highscores">{{ $t('Highscores') }}</AppRouterLink>
          </li>
          <li class="nav-item">
            <AppRouterLink class="nav-link active" to="personalscores">{{ $t('Your Scores') }}</AppRouterLink>
          </li>
          <li class="nav-item">
            <AppRouterLink class="nav-link active" to="users">{{ $t('Users') }}</AppRouterLink>
          </li>
          <div class="g-desktop-hidden d-flex justify-content-center align-items-center mb-2 mt-2">
            <span class="g-ml-2 g-mr-2 g-medium-font">🌐</span>
            <input type="radio" class="btn-check" name="options-language" id="lang-en" autocomplete="off" @click="languageSelected('en')" :checked="lang === 'en'">
            <label class="btn btn-outline-dark g-mr-2 c-lang-select-button" for="lang-en">en</label>
            <input type="radio" class="btn-check" name="options-language" id="lang-de" autocomplete="off" @click="languageSelected('de')" :checked="lang === 'de'">
            <label class="btn btn-outline-dark g-mr-2 c-lang-select-button" for="lang-de">de</label>
            <input type="radio" class="btn-check" name="options-language" id="lang-es" autocomplete="off" @click="languageSelected('es')" :checked="lang === 'es'">
            <label class="btn btn-outline-dark g-mr-2 c-lang-select-button" for="lang-es">es</label>
          </div>
        </ul>
        <div
          class="g-mobile-hidden d-flex justify-content-end g-flex-1"
        >
          <span v-if="playerName" class="d-flex align-items-center g-mr-2">{{ playerName }}</span>
          <FullScreenToggle class="g-mr-2 g-ml-2 align-self-center"/>
          <LanguageDropdown/>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import LanguageDropdown from 'src/shared-components/LanguageDropdown.vue'
import AppModal from 'src/shared-components/AppModal.vue'
import FullScreenToggle from './FullScreenToggle.vue'
import AppRouterLink from './AppRouterLink.vue'
import { ref, computed } from 'vue'
import {useAppStore} from "stores/app-store";
import {NavRoute, NavService} from "src/router/nav.service";
import { useRouter } from 'vue-router'

const router = useRouter()

const collapsedMenu = ref(true)

const lang = computed(() => useAppStore().language)

function languageSelected (lang: string) {
  useAppStore().setLanguage(lang)
}

function created () {
  router.beforeEach(() => {
    collapsedMenu.value = true
  })
}

const playerName = computed(() => useAppStore().player.name)

function navigateTo (navRoute: NavRoute) {
  new NavService().navigateTo(navRoute)
}

</script>

<style scoped>
.c-navbar-toggler {
  padding: 0.2rem 0.5rem!important;
}

.navbar {

}

.c-shadow {
  box-shadow: 0 15px 80px rgb(34 35 58 / 20%)!important;
}

.c-nav {
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  transition: all 0.3s!important;
  padding-top: 0.3rem!important;
  padding-bottom: 0.3rem!important;
}

@media screen and (max-width: 992px) {
  .c-navbar {
    transition: all 0.3s;
    max-height: 0;
    overflow: hidden;
    padding-left: 5px;
    padding-right: 5px;
  }

  .c-navbar.c-expand {
    max-height: 300px;
  }

  .ml-2-s {
    margin-left: 0.5rem;
  }

  .mb-2-s {
    margin-bottom: 0.5rem;
  }
  .c-center-mobile-only {
    text-align: center;
  }
  .c-lang-select-button {
    font-size: 1rem!important;
  }
}
</style>
