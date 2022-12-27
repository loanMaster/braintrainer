<template>
  <div class="full-width column justify-center items-center flex-1 q-px-sm">
    <LoadingIndicator :showing="isSending" style="z-index: 1" />
    <q-card class="q-pa-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" class="q-gutter-md" v-if="!passwordReset">
        <div class="text-h5">{{ $t('auth.Set new Password') }}</div>

        <q-input
          filled
          v-model="password"
          test="new-password"
          label="Password"
          lazy-rules
          :type="showPassword ? 'text' : 'password'"
          autocomplete="off"
          required
          :rules="[
            (val && isValidPw(val)) ||
              $t(
                'auth.16 characters OR at least 8 characters including a number and a letter'
              ),
          ]"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? matVisibility : matVisibilityOff"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>

        <q-input
          filled
          v-model="passwordVerify"
          test="new-password verify"
          label="Repeat new password"
          lazy-rules
          type="password"
          autocomplete="off"
          required
          :rules="[
            (val) =>
              (val && val.length > 0) || $t('auth.Please type something'),
          ]"
        >
        </q-input>

        <q-btn color="primary" type="submit" :disable="isSending"
          >{{ $t('auth.Reset password') }}
        </q-btn>
      </q-form>

      <div v-if="passwordReset" test="signup-success-msg" class="text-center">
        {{ $t("auth['Password changed']") }}
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { matVisibility } from '@quasar/extras/material-icons';
import { matVisibilityOff } from '@quasar/extras/material-icons';
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';

const $q = useQuasar();
const password = ref('');
const passwordVerify = ref('');
const passwordReset = ref(false);
const authStore = useAuthStore();
const route = useRoute();
const isSending = ref(false);
const showPassword = ref('');

function isValidPw(pw: string) {
  if (pw.length >= 16) {
    return true;
  } else if (pw.length < 8) {
    return false;
  }
  return /\d/g.test(pw) && /[a-zA-Z]/g.test(pw);
}

async function submit() {
  if (password.value !== passwordVerify.value) {
    $q.notify({
      group: 'set-new-password',
      message: 'Passwords are not identical',
      color: 'red',
      timeout: 2000,
    });
    return;
  }
  try {
    isSending.value = true;
    await authStore.resetPassword({
      password: password.value,
      uuid: route.query.uuid,
      token: route.query.token,
      redirect: false,
    });
    passwordReset.value = true;
  } catch (error: any) {
    $q.notify({
      group: 'set-new-password',
      message: 'Changing password failed',
      color: 'red',
      timeout: 2000,
    });
  }
  isSending.value = false;
}
</script>
