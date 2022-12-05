<template>
  <div class="flex-1 relative-position column items-center q-ma-lg">
   <ProgressDiagram :difficulty="difficulty" :nameOfTheGame="game"/>
    <div class="q-mx-auto text-center">
      <q-btn color="secondary" @click="back()">Zurück</q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, Ref, computed } from 'vue';
  import { useQuasar } from 'quasar';
  import {useI18n} from "vue-i18n";
  import LoadingIndicator from 'src/components/shared/LoadingIndicator.vue';
  import ProgressDiagram from 'src/components/shared/ProgressDiagram.vue';
  import {useRoute, useRouter} from "vue-router";

  const router = useRouter()
  const route = useRoute()

  function back () {
    router.push({ name: 'playerscores' })
  }

  const difficulty = computed(() => route.params.difficulty)
  const game = computed(() => route.params.game)

</script>
