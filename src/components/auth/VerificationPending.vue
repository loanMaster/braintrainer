<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="q-pa-md max-width-xs full-width shadow-8 q-gutter-md">
      <div class="text-h5">{{ $t('auth.Email verification pending') }}</div>
      <div>
        {{
          $t(
            "auth['Thank you for signing up. To activate your account click on the link in the verification email which was sent to { email }.']",
            { email }
          )
        }}
      </div>
      <q-btn
        color="primary"
        type="button"
        @click="sendVerificationEmail"
        test="send-verification-email"
        :disabled="emailSent"
      >
        {{ $t('auth.Resend verification email') }}
      </q-btn>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useQuasar } from 'quasar';
import {useI18n} from "vue-i18n";

const $q = useQuasar();
const {t} = useI18n()
const authStore = useAuthStore();
const emailSent = ref(false);
const email = computed(() => authStore.email);

async function sendVerificationEmail() {
  const result = await authStore.sentVerificationLink();
  if (result.error) {
    $q.notify({
      group: 'send-verification-email',
      message: t('auth.An error occurred when sending the e-mail'),
      color: 'red',
      timeout: 5000,
    });
  } else {
    emailSent.value = true;
    $q.notify({
      group: 'send-verification-email',
      message: 'Verification email sent',
      color: 'green',
      timeout: 2000,
    });
  }
}
</script>
