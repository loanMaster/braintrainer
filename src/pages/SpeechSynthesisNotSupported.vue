<template>
  <div class="text-center q-pa-md flex flex-center">
    <div class="text-h5" v-if="notSupportedAtAll">
      <span v-html="$t('NotSupported.notSupported')"></span><br />
      <span v-html="$t('NotSupported.downloadChrome')"></span>
    </div>
    <div class="text-h5" v-if="langNotSupported">
      <p v-html="$t('NotSupported.lang')"></p>
      <br />
      <p v-html="$t('NotSupported.installAndroid')"></p>
      <br />
      <p v-html="$t('NotSupported.installWindows')"></p>
      <br />
      <p v-html="$t('NotSupported.installMac')"></p>
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
      .find(
        (v) =>
          v.name.substring(0, 2).toLocaleLowerCase().indexOf(store.language) ===
          -1
      )
  );
});
</script>
