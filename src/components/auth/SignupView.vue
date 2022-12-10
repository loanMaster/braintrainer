<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="q-pa-sm-xl q-pa-xs-md max-width-xs full-width shadow-8">
      <q-form @submit="submit">
        <div class="text-h5 q-mb-md">Sign Up</div>

        <GoogleLoginButton class="q-my-md" :disable="submitting" />

        <div class="text-h6 q-mt-md">Sign up with email</div>
        <q-input
          filled
          class="q-mb-sm"
          v-model="email"
          test="signup-email"
          label="Email address"
          type="email"
          lazy-rules
          autofocus
          error-message="Please enter a valid email xxx"
          :rules="[(val) => (val && val.length > 0) || 'Please type something']"
        />

        <q-input
          filled
          v-model="password"
          test="login-password"
          label="Password"
          lazy-rules
          :type="showPassword ? 'test' : 'password'"
          autocomplete="off"
          required
          error-message="Please enter a valid password"
          :rules="[
            (val) => (val && val.length >= 8) || 'At least 8 characters',
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
          color="primary"
          type="submit"
          test="signup-submit"
          :disabled="submitting"
        >
          Sign Up
        </q-btn>
        <div v-if="errormsg" test="signup-error-msg" class="text-red">
          {{ errormsg }}
        </div>
        <div class="text-right">
          Already registered
          <router-link :to="{ name: 'login' }">sign in?</router-link>
        </div>
      </q-form>
      <div v-if="signedUp" test="signup-success-msg">
        Thank you for signing up. To activate your account click on the link in
        the verification email you will receive shortly.
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import GoogleLoginButton from './GoogleLoginButton.vue';
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';

const email = ref('');
const password = ref('');
const errormsg = ref('');
const signedUp = ref(false);
const submitting = ref(false);
const showPassword = ref(false);

const authStore = useAuthStore();

async function submit() {
  try {
    errormsg.value = '';
    submitting.value = true;
    await authStore.signup({
      method: 'password',
      email: email.value,
      password: password.value,
      username: '',
      image: '/images/avatars/default_avatar.png',
      redirect: false,
    });
    signedUp.value = true;
  } catch (error: any) {
    errormsg.value = error.message;
  } finally {
    submitting.value = false;
  }
}
</script>
