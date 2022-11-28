<template>
  <router-link class="nav-link active" :to="`${path}`"
    ><slot></slot
  ></router-link>
</template>

<script setup lang="ts">
import { NavService } from 'src/router/nav.service';
import { defineProps } from 'vue';

const props = defineProps({
  to: String,
  nameOfTheGame: String,
  difficulty: String,
});

function getPath() {
  return new NavService().getPath({
    name: props.to!,
    nameOfTheGame: props.nameOfTheGame,
    difficulty: props.difficulty,
  });
}
</script>
