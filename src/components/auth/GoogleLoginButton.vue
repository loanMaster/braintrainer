<template>
  <q-btn test="google-login-submit" @click="login" :disable="disable">
    <img src="/images/google.svg" />
    <span>Google</span>
  </q-btn>
</template>

<script setup lang="ts">
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();

defineProps({
  disable: Boolean,
});

function login() {
  authStore.signup({ method: 'google' });
}
</script>

<style scoped>
img {
  width: 35px;
  height: 35px;
  margin-right: 6px;
}
</style>
