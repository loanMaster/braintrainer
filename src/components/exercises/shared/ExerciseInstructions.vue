<template>
  <div>
    <q-card class="q-ma-sm">
      <q-card-section class="text-center">
        Merken Sie sich die Ziffern und wiederholen Sie sie in der gleichen Reihenfolge.
      </q-card-section>
      <q-card-section class="text-center">
        Klicken Sie auf "START" sobald Sie bereit sind.
      </q-card-section>
      <q-separator dark />

      <q-card-actions class="justify-center">
        <q-btn color="primary" @click="confirm">START</q-btn>
      </q-card-actions>
    </q-card>
  </div>
</template>

<script setup lang="ts">
  import { defineEmits } from 'vue'
  import {useAppStore} from "stores/app-store";

  const store = useAppStore()
  const emits = defineEmits(['confirm'])
  function confirm() {
    emits('confirm')
  }
</script>
