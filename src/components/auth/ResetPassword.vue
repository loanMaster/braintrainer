<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="q-pa-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" class="q-gutter-md">
        <div class="text-h5">{{ $t('auth.Reset Password') }}</div>

        <q-input
          filled
          v-model="email"
          test="reset-password-email"
          :label="$t('auth.Email address')"
          type="email"
          autofocus
          lazy-rules
          :rules="[
            (val) =>
              (val && val.length > 0) || $t('auth.Please type something'),
          ]"
        />

        <q-btn
          color="primary"
          type="submit"
          test="reset-password-submit"
          :disabled="isSending"
        >
          {{ $t('auth.Reset Password') }}
        </q-btn>
        <div v-if="errormsg" test="reset-password-error-msg" class="text-red">
          {{ errormsg }}
        </div>
      </q-form>
      <div v-if="submitted" test="reset-password-success-msg">
        {{
          $t(
            'auth.You will shortly receive an email with a link to reset your password.'
          )
        }}
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();

const email = ref('');
const errormsg = ref('');
const submitted = ref(false);
const isSending = ref(false);

async function submit() {
  try {
    isSending.value = true;
    await authStore.sendResetLink(email.value);
    submitted.value = true;
  } catch (error: any) {
    isSending.value = false;
    errormsg.value = error.message;
  }
}
</script>
