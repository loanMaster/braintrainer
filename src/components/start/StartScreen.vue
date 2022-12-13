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
      <div class="text-h3 relative-position">{{ $t('APP_NAME') }}</div>
      <div class="column q-mt-xl">
        <q-btn
          color="secondary"
          rounded
          size="xl"
          icon="double_arrow"
          :to="{
            name: 'select-exercise',
            params: { language: store.language },
          }"
          >{{ $t('Train now') }}</q-btn
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
            <img src="/images/promo/promo11.jpg" />
          </q-card>
        </div>
        <div class="col-8 text-center">
          <div class="q-ma-lg">
            <div class="text-h4">
              {{ $t('What is { APP_NAME }?', { APP_NAME: $t('APP_NAME') }) }}
            </div>
            <div class="text-h6 text-justify">
              {{ $t('What is_RESPONSE', { APP_NAME: $t('APP_NAME') }) }}
            </div>
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
            <div class="text-h4">
              Welche Vorteile bietet Gerhinjogging mit Audio?
            </div>
            <div class="text-h6 text-justify">
              {{ $t('benefits_1') }}<br />
              {{ $t('benefits_2') }}<br />
              {{ $t('benefits_3') }}
            </div>
          </div>
        </div>
        <div class="col-4">
          <q-card class="border-box">
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
            <div class="text-h4">
              {{
                $t('How does { APP_NAME } work?', { APP_NAME: $t('APP_NAME') })
              }}
            </div>
            <div class="text-h6 text-justify">
              {{ $t('How does work_RESPONSE', { APP_NAME: $t('APP_NAME') }) }}
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
          :to="{
            name: 'select-exercise',
            params: { language: store.language },
          }"
          >{{ $t('Train now') }}</q-btn
        >
      </div>
    </div>
  </div>
  <div class="full-width column items-center q-pa-lg bg-primary">
    <div
      class="max-width-sm row-sm column-xs justify-between full-width text-center text-white"
    >
      <q-btn flat no-caps class="col-3" @click="showPrivacyStatement">{{
        $t('Privacy')
      }}</q-btn>
      <q-btn flat no-caps class="col-3" @click="showTermsAndConditions">{{
        $t('Terms of service')
      }}</q-btn>
      <q-btn flat no-caps class="col-3" @click="showCookiePolicy">{{
        $t('Cookies')
      }}</q-btn>
      <q-btn flat no-caps class="col-3" @click="showLegalNotice">{{
        $t('Legal notice')
      }}</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from 'quasar';
import MovingColorsBackground from 'src/components/backgrounds/MovingColorsBackground.vue';
import { useI18n } from 'vue-i18n';
import { ref } from 'vue';
import { useAppStore } from 'stores/app-store';

const $q = useQuasar();
const { t } = useI18n();
const store = useAppStore();

function showLegalNotice() {
  $q.dialog({
    message: t('LEGAL_NOTICE'),
    ok: true,
    html: true,
  });
}

function showCookiePolicy() {
  $q.dialog({
    message: t('COOKIE_POLICY'),
    ok: true,
    html: true,
  });
}

function showPrivacyStatement() {
  $q.dialog({
    message: t('PRIVACY_STATEMENT'),
    ok: true,
    html: true,
  });
}

function showTermsAndConditions() {
  $q.dialog({
    message: t('TERMS_AND_CONDITIONS'),
    ok: true,
    html: true,
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
