<template>
  <div class="my-inner-block">
    <div>
      <h3>Email verification pending</h3>
      Thank you for signing up. To activate your account click on the link in
      the verification email which was sent to {{ email }}.
    </div>
    <button
      class="btn btn-dark btn-lg btn-block mt-2"
      type="button"
      @click="sendVerificationEmail"
      test="send-verification-email"
      :disabled="emailSent"
    >
      Resend verification email
    </button>
    <span
      v-my-visible="emailSent"
      class="display-block"
      test="email-sent-successmsg"
      >✉ Email sent</span
    >
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();
const emailSent = ref(false);
const email = computed(() => authStore.email);

async function sendVerificationEmail() {
  await authStore.sentVerificationLink;
}
</script>
