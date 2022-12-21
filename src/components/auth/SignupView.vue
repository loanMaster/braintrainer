<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <LoadingIndicator :showing="submitting" style="z-index: 1" />
    <q-card class="q-pa-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" class="q-gutter-md" v-if="!signedUp">
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

        <q-btn
          color="primary"
          type="submit"
          test="signup-submit"
          :disabled="submitting"
        >
          {{ $t('auth.Sign up') }}
        </q-btn>
        <div class="text-right">
          {{ $t('auth.Already registered?') }}
          <router-link :to="{ name: 'login', params: { language } }">{{
            $t('auth.Sign in here')
          }}</router-link>
        </div>
      </q-form>
      <div v-if="signedUp" test="signup-success-msg">
        {{
          $t(
            "auth['Thank you for signing up. To activate your account click on the link in the verification email you will receive shortly.']"
          )
        }}
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { matVisibility } from '@quasar/extras/material-icons'
import { matVisibilityOff } from '@quasar/extras/material-icons'
import GoogleLoginButton from './GoogleLoginButton.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { ref, computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { useAppStore } from 'stores/app-store';
import { UserService } from 'src/shared-services/user.service';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';

const email = ref('');
const $q = useQuasar();
const { t } = useI18n();
const password = ref('');
const signedUp = ref(false);
const submitting = ref(false);
const showPassword = ref(false);

const authStore = useAuthStore();

function isValidPw(pw: string) {
  if (pw.length >= 16) {
    return true;
  } else if (pw.length < 8) {
    return false;
  }
  return /\d/g.test(pw) && /[a-zA-Z]/g.test(pw);
}

async function submit() {
  submitting.value = true;
  try {
    const signUpResult = await authStore.signup(email.value, password.value);
    if (signUpResult.error) {
      throw signUpResult;
    }
    const result = await new UserService().activate(email.value);
    if (!result.ok) {
      throw result;
    }
    signedUp.value = true;
  } catch (error: any) {
    if (error.message == 'Email exists') {
      $q.notify({
        group: 'signup',
        message: t("auth['error email exists']"),
        color: 'red',
        timeout: 4000,
      });
    } else {
      $q.notify({
        group: 'signup',
        message: t('An error occurred'),
        color: 'red',
        timeout: 4000,
      });
    }
  } finally {
    submitting.value = false;
  }
}

const language = computed(() => useAppStore().language);
</script>
