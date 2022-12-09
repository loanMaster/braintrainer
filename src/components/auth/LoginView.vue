<template>
  <div class="full-width column justify-center items-center flex-1 q-px-sm">
    <q-card class="q-pa-sm-xl q-pa-xs-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" v-if="showForm">
        <div class="text-h4 q-mb-md">Sign In</div>

        <GoogleLoginButton class="q-my-md" :disable="submitting" />

        <div class="text-h5 q-mt-md">Sign in with email</div>
        <q-input
          filled
          class="q-mb-sm"
          v-model="email"
          test="login-email"
          label="Email address"
          type="email"
          autofocus
          lazy-rules
          error-message="Please enter a valid email"
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          filled
          class="q-mb-sm"
          v-model="password"
          test="login-password"
          label="Password"
          lazy-rules
          :type="showPassword ? 'test' : 'password'"
          autocomplete="on"
          required
          error-message="Please enter a valid email"
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
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
          Sign In
        </q-btn>

        <div v-if="errormsg" test="login-error-msg" class="text-red">
          {{ errormsg }}
        </div>
        <p class="forgot-password text-right">
          <router-link test="reset-password-link" to="/reset-password"
            >Forgot password ?</router-link
          >
        </p>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from 'stores/auth-store';
import GoogleLoginButton from './GoogleLoginButton.vue';

const email = ref('');
const password = ref('');
const errormsg = ref('');
const showForm = ref(true);
const submitting = ref(false);
const authStore = useAuthStore();
const showPassword = ref(false);

const route = useRoute();

onBeforeMount(async () => {
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

async function submit() {
  try {
    submitting.value = true;
    errormsg.value = '';
    await authStore.login({
      method: 'password',
      emailOrUsername: email.value,
      password: password.value,
    });
  } catch (error: any) {
    errormsg.value = error.message;
    submitting.value = false;
  }
}
</script>
