<template>
  <q-dialog
    persistent
    v-model="show"
    transition-show="flip-down"
    transition-hide="flip-up"
  >
    <q-card>
      <div class="column max-width-sm justify-round q-pa-lg q-gutter-md">
        <div class="flex-1 column">
          <q-btn color="primary" label="Sign up" class="self-center q-mb-md" :to="{ name: 'signup', params: { language } }"></q-btn>
          <div class="text-justify">
            Sign up with your email addresss or sign in using gmail or your web3 address.
          </div>
        </div>
        <q-separator></q-separator>
        <div class="flex-1 column">
          <q-btn @click="playAsGuest" label="Continue as guest" class="self-center q-mb-md"></q-btn>
          <div class="text-justify">
            Try up to three exercises of braintrainer before creating an account. Your results will not be stored.
            You will not be able to set new highscores.
          </div>
        </div>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
  import {useAppStore} from "../../stores/app-store";
  import { computed, ref } from 'vue'
  import {useRouter} from "vue-router";

  const store = useAppStore()
  const router = useRouter()
  const show = ref(false)

  function playAsGuest () {
    store.$patch({ playingAsGuest: true })
    show.value = false
  }

  const language = computed(() => {
    return store.language
  })

  function showDialog () {
    show.value = true
  }

  defineExpose({
    showDialog
  })
</script>
