<template>
  <div class="row flex-center relative-position flex-1">
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
import { IAppState, Score, useAppStore } from 'stores/app-store';
import { SubscriptionCallbackMutationPatchObject } from 'pinia';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

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
  const scores = (await useAppStore().scoreHistory) || [];
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

  const maxDataPoints = 20;
  const movingAvgWindowSize = data.length < 10 ? 10 : 20;

  var moveMean = [];
  for (let i = 0; i < data.length; i++) {
    let mean = 0;
    for (let j = Math.max(0, i - movingAvgWindowSize + 1); j <= i; j++) {
      mean += data[j];
    }
    mean /= Math.min(i + 1, movingAvgWindowSize);
    moveMean.push(mean);
  }
  Chart.register(...registerables);
  const color = $q.dark.isActive ? 'white' : undefined;
  Chart.defaults.color = color || '';
  const spliceFrom = Math.max(0, data.length - maxDataPoints);
  chartJs = new Chart(chart.value, {
    type: 'bar',
    data: {
      labels: labels.splice(spliceFrom, maxDataPoints),
      datasets: [
        {
          label: `${t(props.nameOfTheGame + '.title')} (${t(
            props.difficulty!
          )})`,
          data: data.splice(spliceFrom, maxDataPoints),
          borderWidth: 1,
        },
        {
          label: `${t(props.nameOfTheGame + '.title')} (${t(
            props.difficulty!
          )})`,
          data: moveMean.splice(spliceFrom, maxDataPoints),
          borderJoinStyle: 'bevel',
          type: 'line',
          pointStyle: false,
          borderWidth: 3,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animations: { animation: false },
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
