<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <LoadingIndicator :showing="submitting" style="z-index: 1" />
    <q-card class="q-pa-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" class="q-gutter-md">
        <div class="text-h5">{{ $t('auth.Sign in') }}</div>

        <GoogleLoginButton :disable="submitting" />

        <div class="text-h6">{{ $t('auth.Sign in with email') }}</div>
        <q-input
          filled
          v-model="email"
          test="login-email"
          :label="$t('auth.Email address')"
          data-testid="email-input"
          type="email"
          lazy-rules
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
          data-testid="password-input"
          lazy-rules
          :type="showPassword ? 'test' : 'password'"
          autocomplete="on"
          required
          :rules="[
            (val) =>
              (val && val.length > 0) || $t('auth.Please type something'),
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

        <div class="row gap">
          <q-btn
            type="submit"
            test="login-submit"
            :disabled="submitting"
            data-testid="submit"
            color="primary"
          >
            {{ $t('auth.Sign in') }}
          </q-btn>

          <q-btn
            :to="{ name: 'signup', params: { language } }"
            type="button"
            color="secondary"
          >
            {{ $t('auth.No account? Sign up here!') }}
          </q-btn>
        </div>
        <div class="forgot-password text-right">
          <router-link
            test="reset-password-link"
            :to="{ name: 'reset-password', params: { language } }"
            >{{ $t('auth.Forgot your password?') }}</router-link
          >
        </div>
      </q-form>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { matVisibility } from '@quasar/extras/material-icons';
import { matVisibilityOff } from '@quasar/extras/material-icons';
import { ref, onBeforeMount, computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import GoogleLoginButton from './GoogleLoginButton.vue';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
import { useQuasar } from 'quasar';
import { useAppStore } from 'stores/app-store';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const $q = useQuasar();
const email = ref('');
const password = ref('');
const submitting = ref(false);
const authStore = useAuthStore();
const showPassword = ref(false);
const { t } = useI18n();
const route = useRoute()

onBeforeMount(async () => {
  await authStore.redirectIfLoggedIn();
  if (route.query.uuid && route.query.token) {
    try {
      submitting.value = true
      await authStore.login({
        method: 'link',
        uuid: route.query.uuid as string,
        token: route.query.token as string,
        redirect: '/user-settings',
      });
    } catch (error) {
      $q.notify({
        message: t("auth['There was an error during login.']"),
        color: 'red',
        timeout: 30000,
      });
    } finally {
      submitting.value = false
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
      message: t(
        "auth['There was an error during login. Please verify your e-mail address and password.']"
      ),
      color: 'red',
      timeout: 2000,
    });
    submitting.value = false;
  }
}
</script>

<style scoped lang="scss">
.gap {
  gap: 5px;
}
</style>
