import Vue from 'vue'
import { ECharts } from 'echarts'

export default class VueEChartsComponent extends Vue {
  public static defaultTheme?: object | string

  public static defaultLazy: boolean | IntersectionObserverInit

  public static defaultAutoResize: boolean | number

  public instance?: ECharts
}
