<template>
  <AppModal
    :title="'😴💤'"
    :show-modal="isPaused"
    @cancel="unpause"
    @confirm="unpause"
    @confirmButtonTitle = "'OK'"
    test="disclaimer-modal"
  >
    <span>{{ $t('Application paused') }}</span>
  </AppModal>
</template>

<script setup lang="ts">
import AppModal from 'src/shared-components/AppModal.vue'
import { defineEmits, computed } from 'vue'
import { useAppStore } from "stores/app-store";

const isPaused = computed(() => useAppStore().pause)

function unpause () {
  useAppStore().$patch({ pause: false })
}
</script>
