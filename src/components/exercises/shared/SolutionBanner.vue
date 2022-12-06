<template>
  <div class="absolute-center">
    <transition-group
      appear
      enter-active-class="animated fadeInDown"
      leave-active-class="animated fadeOut"
    >
      <q-banner
        class="text-white bg-red text-center non-selectable"
        v-if="show"
      >
        <div>Die Lösung ist</div>
        <div class="text-bold q-my-sm">{{ solution }}</div>
        <template v-slot:action>
          <div class="full-width text-center">
            <q-btn color="white" outline label="Weiter" @click="onClicked" />
          </div>
        </template>
      </q-banner>
    </transition-group>
  </div>
</template>

<script setup ts="lang">
import { defineProps, defineEmits } from 'vue';

defineProps({
  solution: [String, Number],
  show: Boolean,
});
const emits = defineEmits(['confirmed']);
function onClicked() {
  emits('confirmed');
}
</script>
