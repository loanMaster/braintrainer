<template>
  <q-dialog
    persistent
    v-model="show"
    transition-show="flip-down"
    transition-hide="flip-up"
  >
    <q-card>
      <div class="column max-width-sm justify-round q-pa-lg q-gutter-md">
        <div class="flex-1 column">
          <q-btn
            color="primary"
            :label="$t('auth.Sign up')"
            class="self-center q-mb-md"
            :to="{ name: 'signup', params: { language } }"
          ></q-btn>
          <q-btn
            color="primary"
            :label="$t('auth.Sign in')"
            class="self-center"
            :to="{ name: 'login', params: { language } }"
          ></q-btn>
        </div>
        <q-separator></q-separator>
        <div class="flex-1 column">
          <q-btn
            color="primary"
            @click="playAsGuest"
            data-testid="continueAsGuestButton"
            :label="$t('Continue as guest')"
            class="self-center q-mb-md"
          ></q-btn>
          <div class="text-justify">
            {{
              $t(
                'Try up to three exercises as guest before creating an account.'
              )
            }}
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { useAppStore } from '../../stores/app-store';
import { computed, ref } from 'vue';

const store = useAppStore();
const show = ref(false);

function playAsGuest() {
  store.$patch({ playingAsGuest: true });
  show.value = false;
}

const language = computed(() => {
  return store.language;
});

function showDialog() {
  show.value = true;
}

defineExpose({
  showDialog,
});
</script>
