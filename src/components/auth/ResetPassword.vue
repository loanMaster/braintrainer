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
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import {useQuasar} from "quasar";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();

const $q = useQuasar()
const { t } = useI18n()
const email = ref('');
const errormsg = ref('');
const submitted = ref(false);
const isSending = ref(false);

async function submit() {
  try {
    isSending.value = true;
    await authStore.sendResetLink(email.value);
    $q.notify({
      group: 'reset-password',
      message: t(
        "auth['You will shortly receive an email with a link to reset your password.']"
      ),
      color: 'green',
      timeout: 5000,
    });
    submitted.value = true;
  } catch (error: any) {
    isSending.value = false;
    $q.notify({
      group: 'reset-password',
      message: t('auth.An error occurred when sending the e-mail'),
      color: 'red',
      timeout: 5000,
    });
    errormsg.value = error.message;
  }
}
</script>
