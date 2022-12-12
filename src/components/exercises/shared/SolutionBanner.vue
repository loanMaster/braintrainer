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
        <div>{{ $t('The solution is') }}</div>
        <div class="text-bold q-my-sm">{{ solution }}</div>
        <slot></slot>
        <template v-slot:action>
          <div class="full-width text-center">
            <q-btn
              color="white"
              outline
              :label="$t('Continue')"
              @click="onClicked"
            />
          </div>
        </template>
      </q-banner>
    </transition-group>
  </div>
</template>

<script setup ts="lang">
defineProps({
  solution: [String, Number],
  show: Boolean,
});
const emits = defineEmits(['confirmed']);
function onClicked() {
  emits('confirmed');
}
</script>
