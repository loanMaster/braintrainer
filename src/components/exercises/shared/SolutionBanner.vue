<template>
  <div class="absolute-center">
    <transition-group appear enter-active-class="animated fadeInDown" leave-active-class="animated fadeOut">
      <q-banner class="text-white bg-red text-center non-selectable" v-if="show" @click="onClicked">
        <div>Die Lösung ist</div>
        <div class="text-bold q-my-sm">{{ solution }}</div>
        <div>Klicken, um fortzufahren</div>
      </q-banner>
    </transition-group>
  </div>
</template>

<script setup ts="lang">
import { defineProps, defineEmits } from 'vue'

defineProps({
  solution: String,
  show: Boolean
})
const emits = defineEmits(['clicked'])
function onClicked() {
  emits('clicked')
}
</script>
