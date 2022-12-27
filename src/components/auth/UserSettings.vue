<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <LoadingIndicator :showing="isSending" style="z-index: 1" />
    <q-card class="row justify-around full-width max-width-xs q-pa-lg">
      <div class="text-h5 col-6">{{ $t("auth['Your profile']") }}</div>
      <div class="col-6 q-gutter-sm">
        <div class="text-h6">{{ authStore.email }}</div>
        <div class="text-h6 col-6">{{ $t('Avatar') }}</div>
        <q-btn-dropdown
          color="primary"
          size="xl"
          class="text-h1"
          data-testid="avatar-dropdown"
        >
          <template v-slot:label>
            <q-avatar size="5rem">
              <img :src="currentAvatar" />
            </q-avatar>
          </template>
          <q-list>
            <q-item
              clickable
              v-close-popup
              :data-testid="'select-avatar-' + avatar"
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
            data-testid="username-input"
            :label="$t('Username')"
            type="text"
            lazy-rules
            maxlength="30"
            @update:model-value="
              username = username.toLowerCase().replaceAll(' ', '')
            "
            :hint="$t('auth.lower case letters and hyphens only')"
            :rules="[
              (val) =>
                (val && val.length > 2) || $t('auth.Please type something'),
              (val) =>
                /^[a-z0-9\-]+$/.test(val) ||
                $t('auth.lower case letters and hyphens only'),
            ]"
          />
          <div class="col-6 q-mt-sm">
            <q-btn
              color="primary"
              type="submit"
              :disable="isSending"
              data-testid="save-user-settings"
              >{{ $t('auth.Save changes') }}</q-btn
            >
          </div>
        </q-form>
      </div>

      <div class="row justify-around full-width max-width-xs q-mt-lg">
        <div class="text-h5 col-6">{{ $t('auth.Account') }}</div>
        <div class="col-6 q-gutter-sm">
          <q-btn
            color="primary"
            :disable="isSending || submitted"
            @click="resetPassword"
            >{{ $t('auth.Reset password') }}</q-btn
          >
          <q-btn color="negative" :disable="isSending" @click="deleteAccount">{{
            $t('auth.Delete account')
          }}</q-btn>
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
import { UserService } from 'src/shared-services/user.service';
import { useI18n } from 'vue-i18n';
import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';

const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();

const avatars = ref(
  Array.from(new Array(25).keys()).map(
    (v) => `/images/avatars/avatar_${padNumber(v, 2)}.jpg`
  )
);
const isSending = ref(false);
const submitted = ref(false);
const currentAvatar = ref(authStore.image);
const username = ref(authStore.username);

function onItemClick(avatar: string) {
  currentAvatar.value = avatar;
}

async function saveChanges() {
  isSending.value = true;
  try {
    await authStore.update(username.value!, currentAvatar.value!);
    $q.notify({
      group: 'update-user',
      message: t('Changes saved'),
      color: 'green',
      timeout: 1000,
    });
  } catch (error: any) {
    if (error.response?.data?.message === 'Username exists') {
      $q.notify({
        group: 'update-user',
        message: t("auth['error username exists']"),
        color: 'red',
        timeout: 4000,
      });
    } else {
      throw error;
    }
  } finally {
    isSending.value = false;
  }
}

async function resetPassword() {
  try {
    isSending.value = true;
    const result = await new UserService().resetPassword(authStore.email);
    if (!result.ok) {
      throw result;
    }
    $q.notify({
      group: 'reset-password',
      message: t(
        "auth['You will shortly receive an email with a link to reset your password.']"
      ),
      color: 'green',
      timeout: 5000,
    });
    submitted.value = true;
  } catch (error: any) {
    $q.notify({
      group: 'reset-password',
      message: t('auth.An error occurred when sending the e-mail'),
      color: 'red',
      timeout: 5000,
    });
  }
  isSending.value = false;
}

async function deleteAccount() {
  $q.dialog({
    message: t(
      "auth['Are you sure that you want to delete your account? This action can not be undone.']"
    ),
    ok: {
      label: t('Yes'),
    },
    cancel: {
      label: t('No'),
    },
  }).onOk(async () => {
    await new UserService().deleteAccount();
    useAuthStore().logout({ redirect: true });
  });
}
</script>
