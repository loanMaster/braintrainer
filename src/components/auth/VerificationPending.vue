<template>
  <q-card>
    <div>
      <h3>{{ $t('Email verification pending') }}</h3>
      {{ $t('Thank you for signing up. To activate your account click on the link in the verification email which was sent to { email }.', { email })}}
    </div>
    <q-btn
      color="primary"
      type="button"
      @click="sendVerificationEmail"
      test="send-verification-email"
      :disabled="emailSent"
    >
      {{ $t('Resend verification email') }}
    </q-btn>
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const authStore = useAuthStore();
const emailSent = ref(false);
const email = computed(() => authStore.email);

async function sendVerificationEmail() {
  await authStore.sentVerificationLink();
  emailSent.value = true;
  $q.notify({
    group: 'send-verification-email',
    message: 'Verification email sent',
    color: 'green',
    timeout: 2000,
  });
}
</script>
