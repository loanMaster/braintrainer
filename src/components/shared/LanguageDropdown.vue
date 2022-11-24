<template>
  <div class="d-flex justify-content-center">
    <div class="dropdown m-auto d-flex flex-column align-items-start">
      <button class="btn dropdown-toggle g-tiny-font" type="button" @click="show = !show">
        🌐 {{ $t('LANGUAGE') }}
      </button>
      <ul class="dropdown-menu c-dropdown-menu" :class="show ? 'show' : ''">
        <li><a class="dropdown-item g-tiny-font" href="#" @click="languageSelected('en')">English</a></li>
        <li><a class="dropdown-item g-tiny-font" href="#" @click="languageSelected('de')">Deutsch</a></li>
        <li><a class="dropdown-item g-tiny-font" href="#" @click="languageSelected('es')">Español</a></li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {useAppStore} from "stores/app-store";
import {useI18n} from "vue-i18n";

const show = ref(false)
const i18n = useI18n()

function languageSelected (lang: string) {
  useAppStore().setLanguage(i18n, lang)
  show.value = false
}
</script>

<style scoped>
  .c-dropdown-menu {
    top: 2.5rem;
    right: -0.5rem;
  }
</style>
