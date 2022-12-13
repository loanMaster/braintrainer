<template>
  <div class="full-width column justify-center items-center flex-1 q-px-sm">
    <q-card class="q-pa-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" class="q-gutter-md">
        <div class="text-h5">{{ $t('Set new Password') }}</div>

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
            (val) => (val && val.length > 0) || $t('Please type something'),
          ]"
        >
          <template v-slot:append>
            <q-icon
              :name="showPassword ? 'visibility' : 'visibility_off'"
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
            (val) => (val && val.length > 0) || $t('Please type something'),
          ]"
        >
        </q-input>

        <q-btn color="primary" type="submit">{{ $t('Reset password') }} </q-btn>
        <div v-if="passwordReset">{{ $t('Password changed') }}</div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const password = ref('');
const passwordVerify = ref('');
const passwordReset = ref(false);
const authStore = useAuthStore();
const route = useRoute();
const showPassword = ref('');

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
    await authStore.resetPassword({
      password: password,
      uuid: route.query.uuid,
      token: route.query.token,
      redirect: false,
    });
    $q.notify({
      group: 'set-new-password',
      message: 'Password was changed sucessfully',
      color: 'green',
      timeout: 2000,
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
}
</script>
