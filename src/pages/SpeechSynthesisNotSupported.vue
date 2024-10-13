<template>
  <div class="text-center q-pa-md flex flex-center">
    <div class="text-h5" v-if="notSupportedAtAll">
      <span v-html="$t('NotSupported.notSupported')"></span><br />
      <span v-html="$t('NotSupported.downloadChrome')"></span>
    </div>
    <div class="text-h5" v-if="langNotSupported">
      <span v-html="$t('NotSupported.lang')"></span><br />
      <span v-html="$t('NotSupported.installAndroid')"></span>
      <span v-html="$t('NotSupported.installWindows')"></span>
      <span v-html="$t('NotSupported.installMac')"></span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useAppStore } from 'src/stores/app-store';
import { computed } from 'vue';

const store = useAppStore();

const notSupportedAtAll = computed(() => {
  return (
    !window.speechSynthesis || window.speechSynthesis.getVoices().length === 0
  );
});

const langNotSupported = computed(() => {
  return (
    window.speechSynthesis &&
    window.speechSynthesis
      .getVoices()
      .find((v) => v.name.substring(0, 2).indexOf(store.language) === -1)
  );
});
</script>
