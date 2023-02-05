<template>
  <div
    class="bg-gradient full-width column justify-center items-center flex-1 q-px-sm"
  >
    <q-card class="row justify-around full-width max-width-xs q-pa-lg">
      <div class="row-sm column-xs justify-around full-width max-width-xs">
        <div class="text-h5 col-sm-6">{{ $t("auth['Your profile']") }}</div>
        <div class="col-sm-6 q-gutter-sm">
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
              :rules="[
                (val) =>
                  (val && val.length > 2) || $t('auth.Please type something'),
              ]"
            />
            <div class="col-6 q-mt-sm">
              <q-btn
                color="primary"
                type="submit"
                data-testid="save-user-settings"
                >{{ $t('auth.Save changes') }}</q-btn
              >
            </div>
          </q-form>
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
import { useI18n } from 'vue-i18n';

const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();

const avatars = ref(
  Array.from(new Array(25).keys()).map(
    (v) => `/images/avatars/avatar_${padNumber(v, 2)}.jpg`
  )
);
const currentAvatar = ref(authStore.image);
const username = ref(authStore.username);

function onItemClick(avatar: string) {
  currentAvatar.value = avatar;
}

async function saveChanges() {
  await authStore.update(username.value!, currentAvatar.value!);
  $q.notify({
    group: 'update-user',
    message: t('Changes saved'),
    color: 'green',
    timeout: 1000,
  });
}
</script>
