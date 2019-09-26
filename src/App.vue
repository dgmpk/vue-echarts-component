<template>
  <div id="app">
    <div class="screen">
      <p>通过 props 手动管理状态</p>
      <VueEChartsComponent
        class="chart"
        :option="chart1Option"
        :loading="chart1Loading"
        @init="fetchChart1Data"
      />
    </div>
    <div class="screen">
      <p>再封装一层：实现状态自动管理</p>
      <VECharts
        ref="chart2"
        class="chart"
        :get-option="chart2OptionGenerator"
        theme="primary"
        @timelinechanged="changeYear"
        @click="changeMonth"
      />
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, Watch,
} from 'vue-property-decorator'
import { ECharts } from 'echarts'
import random from 'lodash/random'
import VueEChartsComponent from '@/components/VueEChartsComponent'
import VECharts, { EChartOptionOrNull, EChartOptionOrNullOrLabel } from '@/components/VECharts.vue'
import {
  createArray,
  sleep,
  getNumberOfDaysInTheMonth,
} from '@/utils'

const MAX_YEAR_NUMBER = 5

const NOW = new Date()
const THIS_MONTH = NOW.getMonth() + 1
const THIS_YEAR = NOW.getFullYear()
const START_YEAR = THIS_YEAR - MAX_YEAR_NUMBER + 1

@Component({
  name: 'App',
  components: {
    VueEChartsComponent,
    VECharts,
  },
})
export default class App extends Vue {
  $refs!: {
    chart2: VECharts
  }

  chart1Data: Array<{ name: string, value: number }> = []

  chart1Loading = false

  async fetchChart1Data() {
    this.chart1Loading = true
    await sleep(500)
    this.chart1Data = ['第一产业（农业）', '第二产业（工业）', '第三产业（服务业）'].map(name => ({
      name,
      value: random(5000, 15000),
    }))
    this.chart1Loading = false
  }

  get chart1Option(): EChartOptionOrNull {
    if (!this.chart1Data) {
      return null
    }
    return {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      series: [
        {
          type: 'pie',
          radius: [0, '75%'],
          label: {
            formatter: '{b}',
            position: 'inner',
            emphasis: {
              textStyle: {
                fontSize: 20,
              },
            },
          },
          data: this.chart1Data,
        },
      ],
    }
  }

  chart2Query = {
    year: THIS_YEAR,
    month: THIS_MONTH,
  }

  @Watch('chart2Query', { deep: true })
  flushChart2() {
    this.$refs.chart2.flush()
  }

  chart2Data: number[][] = []

  async chart2OptionGenerator(): Promise<EChartOptionOrNullOrLabel> {
    const {
      year,
      month,
    } = this.chart2Query
    const targetYearIndex = year - START_YEAR
    const targetMonthIndex = month - 1
    if (!this.chart2Data[targetYearIndex]) {
      await sleep(500)
      this.chart2Data[targetYearIndex] = createArray(12, i => {
        let value = random(5000, 15000)
        const currentMonth = i + 1
        if (year === THIS_YEAR && currentMonth === THIS_MONTH) {
          value *= NOW.getDate() / getNumberOfDaysInTheMonth(year, currentMonth)
        }
        return +value.toFixed()
      })
    }

    const dataCache = this.chart2Data
    return {
      // @ts-ignore
      baseOption: {
        timeline: {
          axisType: 'category',
          currentIndex: targetYearIndex,
          data: createArray(5, i => `${i + START_YEAR}年`),
          label: {
            formatter: (s: string) => s.slice(0, -1),
          },
          controlStyle: {
            showPlayBtn: false,
          },
        },
        tooltip: {},
        calculable: true,
        grid: {
          top: 40,
          bottom: 100,
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
              label: {
                show: true,
                formatter(params: any) {
                  return params.value.replace('\n', '')
                },
              },
            },
          },
        },
        xAxis: [
          {
            type: 'category',
            splitLine: {
              show: false,
            },
            data: createArray(12, i => `${i + 1}月`),
          },
        ],
        yAxis: [
          {
            type: 'value',
            name: '件数',
          },
        ],
        series: [
          {
            name: '打标签数量',
            type: 'bar',
            label: {
              show: true,
            },
          },
        ],
      },
      options: createArray(5, i => ({
        series: [
          {
            encode: {
              y: i + 1,
            },
            emphasis: {
              label: true,
            },
            data: dataCache[i],
            markPoint: i === targetYearIndex ? {
              silent: true,
              data: [
                {
                  coord: [targetMonthIndex, dataCache[i][targetMonthIndex]],
                },
              ],
            } : null,
          },
        ],
      })),
    }
  }

  changeYear(_instance: ECharts, params: any) {
    const year = params.currentIndex + START_YEAR
    if (year !== this.chart2Query.year) {
      this.chart2Query = {
        year: params.currentIndex + START_YEAR,
        month: 1,
      }
    }
  }

  changeMonth(_instance: ECharts, params: any) {
    if (params.seriesType === 'bar') {
      this.chart2Query.month = params.dataIndex + 1
    }
  }
}
</script>

<style lang="scss">
#app {
  text-align: center;
  font-size: 30px;
  line-height: 1.5;
  color: #2c3e50;
}
.screen {
  overflow: hidden;
  height: 100vh;
}
.chart {
  height: 400px;
}
</style>
