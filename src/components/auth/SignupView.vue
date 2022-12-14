<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="q-pa-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" class="q-gutter-md">
        <div class="text-h5">{{ $t('auth.Sign up') }}</div>

        <GoogleLoginButton :disable="submitting" />

        <div class="text-h6">{{ $t('auth.Sign up with email') }}</div>
        <q-input
          filled
          v-model="email"
          test="signup-email"
          :label="$t('auth.Email address')"
          type="email"
          lazy-rules
          autofocus
          :rules="[
            (val) =>
              (val && val.length > 0) || $t('auth.Please type something'),
          ]"
        />

        <q-input
          filled
          v-model="password"
          test="login-password"
          :label="$t('auth.Password')"
          lazy-rules
          :type="showPassword ? 'test' : 'password'"
          autocomplete="off"
          required
          :rules="[
            (val) =>
              (val && val.length >= 8) || $t('auth.At least 8 characters'),
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
          {{ $t('auth.Sign up') }}
        </q-btn>
        <div v-if="errormsg" test="signup-error-msg" class="text-red">
          {{ errormsg }}
        </div>
        <div class="text-right">
          {{ $t('auth.Already registered?') }}
          <router-link :to="{ name: 'login', params: { language } }">{{
            $t('auth.Sign in here')
          }}</router-link>
        </div>
        <div v-if="signedUp" test="signup-success-msg">
          {{
            $t(
              'auth.Thank you for signing up. To activate your account click on the link in the verification email you will receive shortly.'
            )
          }}
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import GoogleLoginButton from './GoogleLoginButton.vue';
import { ref, computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useAppStore } from 'stores/app-store';

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

const language = computed(() => useAppStore().language);
</script>
