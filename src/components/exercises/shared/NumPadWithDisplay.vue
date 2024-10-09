<template>
  <q-card>
    <q-card-section>
      <div class="q-ma-auto text-center">
        <NumPad :disabled="inputDisabled" @button-click="onNumberEntered" />
      </div>
    </q-card-section>
    <q-card-section>
      <div class="row justify-between items-center">
        <div class="flex-1 c-num-field text-center non-selectable q-mr-xs">
          {{ inputValue }}
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import NumPad from 'src/components/exercises/shared/NumPad.vue';

const emits = defineEmits(['button-click']);
defineProps({
  inputValue: String,
  inputDisabled: Boolean,
});

function onNumberEntered(num: number) {
  emits('button-click', num);
}
</script>

<style scoped>
.c-num-field {
  color: gray;
  border-radius: 25px;
  border: 1px solid gray;
  background-color: whitesmoke;
  font-size: 1.5rem;
  min-height: 2.5rem;
}
</style>
