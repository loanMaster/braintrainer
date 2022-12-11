<template>
  <div class="full-width column items-center q-pa-lg">
    <div
      class="column items-center q-pa-lg full-width relative-position overflow-hidden bg-abs q-mb-sm-xl q-mb-xs-md"
    >
      <div class="absolute-full half-transparent"></div>
      <MovingColorsBackground />
      <q-img
        style="width: 280px"
        src="/images/logo_transparent.png"
        spinner-color="white"
      />
      <div class="text-h3 relative-position">BrianTrainer</div>
      <div class="column q-mt-xl">
        <q-btn color="secondary" rounded size="xl" icon="double_arrow" :to="{ name: 'select-exercise', params: { language: store.language } }"
          >Jetzt trainieren</q-btn
        >
      </div>
    </div>

    <div
      class="max-width-sm column items-center relative-position q-my-sm-lg q-my-xs-md"
    >
      <div
        class="row-sm column-xs max-width-sm justify-center items-center relative-position q-px-md"
      >
        <div class="col-4 q-mb-xs-md">
          <q-card class="border-box">
            <img src="/images/promo/enlightd.png" />
          </q-card>
        </div>
        <div class="col-8 text-center">
          <div class="q-ma-lg">
            <div class="text-h4">Was ist Audio trainer?</div>
            <div class="text-h6 text-justify">TODO ist eine Gehirnjogging app mit Audio-Gehirnjoggingübungen, um Ihre geistige Leistungsfähigkeit zu verbessern.
            Mit verschiedenen Übungen und Herausforderungen und persönlichen Fortschrittsberichten bleibst Du motiviert und auf Kurs.
                 Probiere es jetzt aus und verbessere Deine Gehirnleistung mit Gehirnjogging via Audio!</div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="full-width column items-center relative-position overflow-hidden bg-abs q-my-sm-lg q-my-xs-md"
    >
      <div class="absolute-full half-transparent"></div>
      <MovingColorsBackground />
      <div
        class="row-sm max-width-sm justify-center items-center relative-position column-xs q-pa-md"
      >
        <div class="col-8 text-center q-mb-xs-md">
          <div class="q-ma-lg">
            <div class="text-h4">Welche Vorteile bietet Gerhinjogging mit Audio?</div>
            <div class="text-h6 text-justify">
              -Es stärkt das Gedächtnis<br/>
              -Die Übungen sind abwechslungsreich<br/>
              -Die Übungen sind nützlich, da wir im Alltag häufig auf auditorische Information reagieren müssen (z.B. im Gespräch)
            </div>
          </div>
        </div>
        <div class="col-4">
          <q-card  class="border-box">
            <img src="/images/promo/promo4.jpg" />
          </q-card>
        </div>
      </div>
    </div>

    <div
      class="max-width-sm column items-center relative-position q-my-sm-lg q-my-xs-md"
    >
      <div
        class="row-sm column-xs max-width-sm justify-center items-center q-px-md"
      >
        <div class="col-4 q-mb-xs-md">
          <q-card class="border-box">
            <img src="/images/promo/promo3.jpg" />
          </q-card>
        </div>
        <div class="col-8 text-center">
          <div class="q-ma-lg">
            <div class="text-h4">Wie funktioniert der Audiotrainer?</div>
            <div class="text-h6 text-justify">
              Der Audiotrainer bietet eine vielzahl unterschiedlicher Übungen an, Dein Gehirn zu trainieren.
              Registriere Dich via email oder web3 oder teste den Audiotrainer als Gast.
            </div>
          </div>
        </div>
      </div>

      <div class="column q-mt-md">
        <q-btn
          color="primary"
          rounded
          size="xl"
          icon="double_arrow"
          class="q-mb-lg"
          :to="{ name: 'select-exercise', params: { language: store.language } }"
          >Jetzt trainieren</q-btn
        >
        <q-btn color="accent" rounded size="xl" icon="menu_book"
          >Anleitung</q-btn
        >
      </div>
    </div>
  </div>
  <div class="full-width column items-center q-pa-lg bg-primary">
    <div
      class="max-width-sm row-sm column-xs justify-between full-width text-center text-white"
    >
      <q-btn flat no-caps class="col-3" @click="showPrivacyStatement"
        >Privacy</q-btn
      >
      <q-btn flat no-caps class="col-3" @click="showTermsAndConditions"
        >Terms of service</q-btn
      >
      <q-btn flat no-caps class="col-3" @click="showCookiePolicy"
        >Cookies</q-btn
      >
      <q-btn flat no-caps class="col-3" @click="showLegalNotice"
        >Legal notice</q-btn
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import MovingColorsBackground from 'src/components/backgrounds/MovingColorsBackground.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import {useAppStore} from "stores/app-store";

const $q = useQuasar();
const { t } = useI18n();
const store = useAppStore()

function showLegalNotice() {
  $q.dialog({
    message: t('LEGAL_NOTICE'),
    ok: 'OK',
    html: true,
    persistent: true,
  });
}

function showCookiePolicy() {
  $q.dialog({
    message: t('COOKIE_POLICY'),
    ok: 'OK',
    html: true,
    persistent: true,
  });
}

function showPrivacyStatement() {
  $q.dialog({
    message: t('PRIVACY_STATEMENT'),
    ok: 'OK',
    html: true,
    persistent: true,
  });
}

function showTermsAndConditions() {
  $q.dialog({
    message: t('TERMS_AND_CONDITIONS'),
    ok: 'OK',
    html: true,
    persistent: true,
  });
}
</script>

<style scoped lang="scss">
.gradient {
  background-image: linear-gradient(to bottom right, #ffffaa55, #aaffff55);
}
.body--dark .gradient {
  background-image: none;
}

.half-transparent {
  opacity: 0.5;
  background-color: var(--q-primary);
}

.border-box {
  box-shadow: 0 2px 8px 0 #d3d3d3;
  padding: 1rem;
}
</style>
