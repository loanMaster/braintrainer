<template>
  <h1 class="text-center mt-4">{{ $t('Users') }}</h1>
  <div class="c-buttons mt-4 g-small-font">
    <div class="c-row mb-2 mt-2 text-center">
      <span>{{ $t('Name') }}</span>
      <span>{{ $t('Delete') }}</span>
    </div>
    <div class="c-row mb-2 mt-2" v-for="player in getPlayers()" :key="player.id" :class="isCurrentUser(player.id) ? 'my-selected-player' : ''">
      <button class="btn btn-outline-dark g-mr-2" @click="selectPlayer(player.id)" :disabled="isCurrentUser(player.id)">
        {{ player.name }}
      </button>
      <button class="btn btn-outline-danger" @click="onDeleteUserClicked(player.id)" :disabled="getPlayerNumber() === 1">🗑</button>
    </div>
    <div class="c-row mb-2 mt-2">
      <button class="btn btn-outline-dark g-mr-2" @click="onCreatePlayerClicked" :disabled="getPlayerNumber() >= 4">{{ $t("Create user") }}</button>
      <span> </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useAppStore} from "stores/app-store";
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import {i18n} from "boot/i18n";
import { useI18n } from 'vue-i18n';
import {showEnterUsernameDialog} from "src/util/show-enter-username-dialog";

const $q = useQuasar()
const { t } = useI18n()

function getStore () {
  return useAppStore();
}

function getPlayers () {
  return getStore().players
}

function getPlayerNumber () {
  return Object.keys(getStore().players).length
}

function selectPlayer (playerId: string) {
  getStore().$patch({ currentPlayerId: playerId })
}

function isCurrentUser (playerId: string): boolean {
  return playerId === getStore().currentPlayerId
}

function onDeleteUserClicked(playerId: string) {
  const username = getStore().players[playerId]?.name
  $q.dialog({
    message: t('Do you want to delete the user {username}?\nThis action can not be undone', { username }),
    cancel: t('No'),
    ok: t('Yes'),
    persistent: true
  }).onOk(() => {
    getStore().deleteUser(playerId)
  })
}

async function onCreatePlayerClicked() {
  const name = await showEnterUsernameDialog($q, t);
  if (name) {
    getStore().addUser(name)
  }
}
</script>

<style scoped>
.c-buttons {
  width: 50%;
  margin: auto;
}
.c-row {
  display:grid;
  grid-template-columns: 85% 15%;
  position: relative;
}
.my-selected-player::before {
  content: "⇨";
  position: absolute;
  left: -1.5rem;
  display: flex;
  align-items: center;
  height: 100%;
}
@media screen and (max-width: 992px) {
  .c-buttons {
    width: 80%;
  }
  .c-row {
    grid-template-columns: 75% 25%
  }
  .c-row .btn, .c-row span {
    font-size: 1rem;
  }
}
</style>
