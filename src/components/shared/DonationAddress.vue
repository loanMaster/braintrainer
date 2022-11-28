<template>
  <span class="c-crypto-address" @click="copy">{{ address }} 📋</span>
</template>

<script setup lang="ts">
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
const { t } = useI18n();
const $q = useQuasar();

const props = defineProps({
  address: String,
});

function copy() {
  navigator.clipboard.writeText(props.address!);
  alert(t('Address copied'));
  $q.dialog({
    title: t('Address copied'),
  });
}
</script>

<style scoped>
.c-crypto-address {
  cursor: pointer;
  overflow-wrap: break-word;
  max-width: 100%;
  word-break: break-all;
}
.c-crypto-address:hover {
  color: blue;
}
</style>
