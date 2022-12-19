<template>
  <div class="row flex-center relative-position flex-1">
    <LoadingIndicator :showing="showLoadingIndicator" />
    <canvas
      ref="chart"
      style="max-width: 100%"
      data-testid="progress-diagram"
    ></canvas>
  </div>
</template>
LoadingIndicator
<script setup lang="ts">
import { Chart, registerables } from 'chart.js';
import { onMounted, ref } from 'vue';
import { Score, ScoreService } from 'src/shared-services/score.service';
import LoadingIndicator from './LoadingIndicator.vue';
import { IAppState, useAppStore } from 'stores/app-store';
import { SubscriptionCallbackMutationPatchObject } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
const showLoadingIndicator = ref(false);

const chart = ref();
let chartJs: Chart;
const { t } = useI18n();
const $q = useQuasar();

const props = defineProps({
  nameOfTheGame: String,
  difficulty: String,
  showLegend: Boolean,
});

onMounted(async () => {
  createChart([]);
  showLoadingIndicator.value = true;
  const scores = await new ScoreService().fetchPlayerScoreHistory();
  showLoadingIndicator.value = false;
  createChart(scores);
});

useAppStore().$subscribe((mutation, state) => {
  const patch = mutation as SubscriptionCallbackMutationPatchObject<IAppState>;
  if (patch.payload && patch.payload.scoreHistory) {
    createChart(state.scoreHistory!);
  }
});

function createChart(values: Score[]) {
  if (chartJs) {
    chartJs.destroy();
  }
  const labels = values
    .filter(
      (h) =>
        h.nameOfTheGame === props.nameOfTheGame &&
        h.difficulty === props.difficulty
    )
    .map((h) => new Date(h.date).toLocaleDateString());
  const data = values
    .filter(
      (h) =>
        h.nameOfTheGame === props.nameOfTheGame &&
        h.difficulty === props.difficulty
    )
    .map((h) => h.score);
  Chart.register(...registerables);
  const color = $q.dark.isActive ? 'white' : undefined;
  Chart.defaults.color = color;
  chartJs = new Chart(chart.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: `${t(props.nameOfTheGame + '.title')} (${t(
            props.difficulty!
          )})`,
          data: data,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: false,
      plugins: {
        legend: {
          display: props.showLegend,
        },
        tooltip: {
          enabled: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawOnChartArea: false,
            display: true,
            color: color,
          },
          max: 100,
          min: 0,
        },
        x: {
          grid: {
            drawOnChartArea: false,
            display: true,
            color: color,
          },
        },
      },
    },
  });
}
</script>
