<template>
  <div class="row flex-center relative-position flex-1">
    <canvas ref="chart" style="max-width: 100%;"></canvas>
  </div>
</template>

<script setup lang="ts">
  import {
    Chart,
    BarController,
    BarControllerChartOptions,
    LinearScale,
    Legend,
    LinearScaleOptions,
    registerables
  } from 'chart.js'
  import { onMounted, ref } from 'vue'
  import { Score, ScoreService } from "src/shared-services/score.service";
  import {IAppState, useAppStore} from "stores/app-store";
  import {SubscriptionCallbackMutationPatchObject} from "pinia";
  import {useI18n} from "vue-i18n";
  const showLoadingIndicator = ref(false)

  const chart = ref()
  let chartJs: Chart
  const { t } = useI18n()

  const props = defineProps({
    nameOfTheGame: String,
    difficulty: String,
    showLegend: Boolean
  })

  onMounted(async() => {
    showLoadingIndicator.value = true
    const scores = await new ScoreService().fetchPlayerScoreHistory()
    showLoadingIndicator.value = false
    createChart(scores)
  })

  useAppStore().$subscribe((mutation, state) => {
    const patch = mutation as SubscriptionCallbackMutationPatchObject<IAppState>
    if (patch.payload && patch.payload.scoreHistory) {
      createChart(state.scoreHistory!)
    }
  })

  function createChart (values: Score[]) {
    if (chartJs) {
      chartJs.destroy()
    }
    const labels = values
      .filter(h => h.nameOfTheGame === props.nameOfTheGame && h.difficulty === props.difficulty)
      .map(h => new Date(h.date).toLocaleDateString())
    const data = values
      .filter(h => h.nameOfTheGame === props.nameOfTheGame && h.difficulty === props.difficulty)
      .map(h => h.score)
    Chart.register(...registerables);
    chartJs = new Chart(chart.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: `${t(props.nameOfTheGame!)} (${t(props.difficulty!)})`,
          data: data,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: props.showLegend
          },
          tooltip: {
            enabled: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              display: false
            },
            max: 100,
            min: 0
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

</script>
