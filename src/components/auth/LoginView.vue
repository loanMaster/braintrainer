<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="q-pa-sm-xl q-pa-xs-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" v-if="showForm">
        <div class="text-h5 q-mb-md">{{ $t('Sign In') }}</div>

        <GoogleLoginButton class="q-my-md" :disable="submitting" />

        <div class="text-h6 q-mt-md">{{ $t('Sign in with email') }}</div>
        <q-input
          filled
          class="q-mb-sm"
          v-model="email"
          test="login-email"
          :label="$t('Email address')"
          type="email"
          autofocus
          lazy-rules
          :rules="[
            (val) => (val && val.length > 0) || $t('Please type something'),
          ]"
        />

        <q-input
          filled
          class="q-mb-sm"
          v-model="password"
          test="login-password"
          :label="$t('Password')"
          lazy-rules
          :type="showPassword ? 'test' : 'password'"
          autocomplete="on"
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

        <q-btn
          type="submit"
          test="login-submit"
          :disabled="submitting"
          color="primary"
        >
          {{ $t('Sign In') }}
        </q-btn>

        <q-btn
          :to="{ name: 'signup', params: { language } }"
          class="q-ml-sm"
          type="button"
          color="secondary"
        >
          {{ $t('No account? Sign up here!') }}
        </q-btn>
        <p class="forgot-password text-right">
          <router-link test="reset-password-link" to="/reset-password">{{
            $t('Forgot your password?')
          }}</router-link>
        </p>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import GoogleLoginButton from './GoogleLoginButton.vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'stores/app-store';

const $q = useQuasar();
const email = ref('');
const password = ref('');
const showForm = ref(true);
const submitting = ref(false);
const authStore = useAuthStore();
const showPassword = ref(false);

const route = useRoute();

onBeforeMount(async () => {
  await authStore.redirectIfLoggedIn();
  if (route.query.uuid && route.query.token) {
    // clear all cookies and reload due to firefox bug.
    if (document.cookie) {
      document.cookie.split(';').forEach((c) => {
        document.cookie = c
          .replace(/^ +/, '')
          .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
        location.reload();
      });
    } else {
      showForm.value = false;
      try {
        await authStore.login({
          method: 'link',
          uuid: route.query.uuid as string,
          token: route.query.token as string,
        });
      } catch (error) {
        showForm.value = true;
      }
    }
  }
});

const language = computed(() => {
  return useAppStore().language;
});

async function submit() {
  try {
    submitting.value = true;
    await authStore.login({
      method: 'password',
      emailOrUsername: email.value,
      password: password.value,
    });
  } catch (error: any) {
    $q.notify({
      group: 'set-new-password',
      message:
        'Error when trying to login. Please verify your email address and password',
      color: 'red',
      timeout: 2000,
    });
    submitting.value = false;
  }
}
</script>
