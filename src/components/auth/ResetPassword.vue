<template>
  <div class="full-width column justify-center items-center flex-1 q-px-sm">
    <q-card class="q-pa-sm-xl q-pa-xs-md max-width-xs full-width shadow-8">
      <q-form @submit="submit" v-if="showForm">
      <div class="text-h5">Reset Password</div>
      <div class="form-group">
        <label>Email address</label>
        <input
          type="email"
          test="reset-password-email"
          class="form-control form-control-lg"
          v-model="email"
          required
          v-my-focus
        />
      </div>

      <button
        type="submit"
        test="reset-password-submit"
        class="btn btn-dark btn-lg btn-block mt-2"
        :disabled="isSending"
      >
        Reset password
      </button>
      <div
        v-if="errormsg"
        test="reset-password-error-msg"
        class="invalid-feedback display-block"
      >
        {{ errormsg }}
      </div>
      </q-form>
    <div v-if="submitted" test="reset-password-success-msg">
      You will shortly receive an email with a link to reset your password.
    </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';

const authStore = useAuthStore();

const email = ref('');
const errormsg = ref('');
const submitted = ref(false);
const isSending = ref(false);

async function submit() {
  try {
    isSending.value = true;
    await authStore.sendResetLink(email.value);
    submitted.value = true;
  } catch (error: any) {
    isSending.value = false;
    errormsg.value = error.message;
  }
}
</script>
