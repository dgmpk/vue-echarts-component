<!-- 建议基于业务再封装一层：可以全局引入 echarts 组件、注册 theme、统一错误处理和提示、实现定制化功能等 -->
<template>
  <div class="wrapper">
    <VueEChartsComponent
      class="stretch"
      :option="currentOption"
      :loading="syncedLoading"
      v-bind="$attrs"
      v-on="$listeners"
      @init="init"
    />
    <div
      v-if="!syncedLoading && (syncedError || syncedTip)"
      class="stretch flexbox"
    >
      <span
        v-if="syncedError"
        class="error"
        @click="retry"
      >加载失败，点击重试</span>
      <template v-else-if="syncedTip">
        {{ syncedTip }}
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import {
  Vue, Component, Prop, Watch,
} from 'vue-property-decorator'
import echarts, { ECharts, EChartOption } from 'echarts'
import VueEChartsComponent from '@/components/VueEChartsComponent'

echarts.registerTheme('default', {
  color: [
    '#3682ea',
    '#5bc42d',
    '#fa9024',
  ],
})

echarts.registerTheme('primary', {
  color: [
    '#ebc71e',
    '#d9ef1c',
    '#22de88',
  ],
})

VueEChartsComponent.defaultTheme = 'default'

export type EChartOptionOrNull = EChartOption | null
export type EChartOptionOrNullOrLabel = EChartOptionOrNull | undefined | string
export type OptionGenerator = (instance: ECharts, option: EChartOptionOrNull, firstCalled: boolean) => Promise<EChartOptionOrNullOrLabel> | EChartOptionOrNullOrLabel

@Component({
  name: 'VECharts',
  components: {
    VueEChartsComponent,
  },
  inheritAttrs: false,
})
export default class VECharts extends Vue {
  // 无数据时可以返回string, 会被居中显示
  @Prop(Function)
  protected readonly getOption?: OptionGenerator

  // 为true时初始化时不会自动执行getOption
  @Prop(Boolean)
  protected readonly passive!: boolean

  @Prop(Object)
  protected readonly option?: EChartOptionOrNull

  @Prop(Boolean)
  protected readonly loading!: boolean

  @Prop(Boolean)
  protected readonly error!: boolean

  @Prop({ type: String, default: '' })
  protected readonly tip!: string

  protected syncedLoading = this.loading

  @Watch('loading')
  syncLoading() {
    this.syncedLoading = this.loading
  }

  protected syncedError = this.error

  @Watch('error')
  syncError() {
    this.syncedError = this.error
  }

  protected syncedTip = this.tip

  @Watch('tip')
  syncTip() {
    this.syncedTip = this.tip
  }

  protected called = false

  protected currentOption: EChartOptionOrNull = null

  protected $echartsInstance?: ECharts

  public get instance(): ECharts | undefined {
    return this.$echartsInstance
  }

  public async flush(): Promise<void> {
    this.called = true
    if (this.$echartsInstance && this.getOption) {
      try {
        this.syncedLoading = true
        this.syncedTip = ''
        const value = await this.getOption(this.$echartsInstance, this.currentOption, !this.called)
        this.syncedError = false
        if (!value) {
          this.currentOption = null
          return
        }
        this.syncedLoading = false
        if (typeof value === 'string') {
          this.syncedTip = value || '没有数据'
          this.currentOption = null
        } else {
          this.currentOption = value
        }
      } catch (e) {
        this.syncedError = true
        this.currentOption = null
        this.syncedLoading = false
        throw e
      }
    }
  }

  retry() {
    if (typeof this.getOption === 'function') {
      this.flush()
    } else {
      this.$emit('retry')
    }
  }

  protected init(instance: ECharts) {
    this.$echartsInstance = instance
    if (typeof this.getOption === 'function') {
      // 如果初始化前手动调用过flush在passive的情况下初始化时亦会自动执行getOption
      if (this.called || !this.passive) {
        this.flush()
      }
    } else {
      this.$watch('option', () => {
        this.currentOption = this.option || null
      }, { immediate: true })
    }
  }
}
</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
}
.stretch {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.flexbox {
  display: flex;
  align-items: center;
  justify-content: center;
}
.error {
  color: #cc3333;
  cursor: pointer;
}
</style>
