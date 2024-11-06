<template>
  <div class="full-width column items-center q-pa-lg">
    <div
      class="column items-center q-pa-lg full-width relative-position overflow-hidden bg-abs q-mb-sm-xl q-mb-xs-md"
    >
      <div class="absolute-full half-transparent"></div>
      <MovingColorsBackground />
      <q-img
        style="max-width: 280px"
        src="images/logo_transparent.png"
        spinner-color="white"
      />
      <div class="text-h3 relative-position">{{ $t('APP_NAME') }}</div>
      <div class="column q-mt-xl">
        <q-btn
          color="secondary"
          rounded
          size="xl"
          :icon="matDoubleArrow"
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
            <img src="images/promo/promo11.jpg" />
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
              {{ $t('What are the benefits of audio brain jogging?') }}
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
            <img src="images/promo/promo4.jpg" />
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
            <img src="images/promo/promo3.jpg" />
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
          :icon="matDoubleArrow"
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
</template>

<script setup lang="ts">
import { matDoubleArrow } from '@quasar/extras/material-icons';
import MovingColorsBackground from 'src/components/backgrounds/MovingColorsBackground.vue';
import { useAppStore } from 'stores/app-store';

const store = useAppStore();
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
