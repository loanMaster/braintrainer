<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <LoadingIndicator :showing="isSending" style="z-index: 1" />
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
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { UserService } from 'src/shared-services/user.service';

const $q = useQuasar();
const { t } = useI18n();
const email = ref('');
const submitted = ref(false);
const isSending = ref(false);

async function submit() {
  try {
    isSending.value = true;
    const result = await new UserService().resetPassword(email.value);
    if (!result.ok) {
      throw result;
    }
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
    $q.notify({
      group: 'reset-password',
      message: t('auth.An error occurred when sending the e-mail'),
      color: 'red',
      timeout: 5000,
    });
  }
  isSending.value = false;
}
</script>
