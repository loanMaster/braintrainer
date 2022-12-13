<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="row justify-around full-width max-width-xs q-pa-lg">
      <div class="text-h5 col-6">{{ $t('Profile') }}</div>
      <div class="col-6 q-gutter-sm">
        <div class="text-h6 col-6">{{ $t('Picture') }}</div>
        <q-btn-dropdown color="primary" size="xl" class="text-h1">
          <template v-slot:label>
            <q-avatar size="5rem">
              <img :src="currentAvatar" />
            </q-avatar>
          </template>
          <q-list>
            <q-item
              clickable
              v-close-popup
              @click="onItemClick(avatar)"
              v-for="avatar in avatars"
              :key="avatar"
            >
              <q-item-section>
                <q-avatar class="q-mx-auto">
                  <img :src="avatar" />
                </q-avatar>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-form @submit="saveChanges">
          <q-input
            filled
            v-model="username"
            :label="$t('Username')"
            type="text"
            lazy-rules
            :rules="[
              (val) => (val && val.length > 0) || $t('Please type something'),
            ]"
          />
          <div class="col-6 q-mt-sm">
            <q-btn color="primary" type="submit" :disable="isSending">{{
              $t('Save changes')
            }}</q-btn>
          </div>
        </q-form>
      </div>

      <div class="row justify-around full-width max-width-xs q-mt-lg">
        <div class="text-h5 col-6">{{ $t('Account') }}</div>
        <div class="col-6 q-gutter-sm">
          <q-btn
            color="primary"
            :disable="isSending || submitted"
            @click="resetPassword"
            >{{ $t('Reset password') }}</q-btn
          >
          <q-btn
            color="negative"
            :disable="isSending"
            @click="deleteAccount"
          >{{ $t('Delete account') }}</q-btn
          >
        </div>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth-store';
import { padNumber } from 'src/util/format-number';
import { useQuasar } from 'quasar';
import {AccountService} from "src/shared-services/account.service";
import {useI18n} from "vue-i18n";

const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n()

const avatars = ref(
  Array.from(new Array(25).keys()).map(
    (v) => `/images/avatars/avatar_${padNumber(v, 2)}.jpg`
  )
);
const isSending = ref(false);
const submitted = ref(false);
const currentAvatar = ref(authStore.image);
const username = ref(authStore.name);

function onItemClick(avatar: string) {
  currentAvatar.value = avatar;
}

function saveChanges() {
  isSending.value = true;
  authStore.update(username.value!, currentAvatar.value!);
  isSending.value = false;
  $q.notify({
    group: 'update-user',
    message: 'Changes saved',
    color: 'green',
    timeout: 1000,
  });
}

async function resetPassword() {
  try {
    isSending.value = true;
    await authStore.sendResetLink(authStore.email!);
    $q.notify({
      group: 'reset-password',
      message: 'Password reset link was sent',
      color: 'green',
      timeout: 1000,
    });
    submitted.value = true;
  } catch (error: any) {
    $q.notify({
      group: 'reset-password',
      message: 'Error sending password reset link',
      color: 'red',
      timeout: 2000,
    });
  }
  isSending.value = false;
}

async function deleteAccount() {
  $q.dialog({
    message: t('Are you sure that you want to delete your account? This action can not be undone.'),
    ok: {
      label: t('Yes')
    },
    cancel: {
      label: t('No')
    }
  }).onOk(async () => {
    await new AccountService().deleteAccount()
    useAuthStore().logout({ redirect: true })
  })
}
</script>
