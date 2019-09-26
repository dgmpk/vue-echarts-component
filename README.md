# vue-echarts-component
> [Vue.js](https://vuejs.org/) `v2.x+` component wrap for [ECharts.js](http://echarts.baidu.com/) `v4.x+`

## Features
* lazy load: 组件进入可视区域时才初始化
* auto resize: 组件大小尺寸变化时自适应

## Usage
### Props
* option?: EChartOption

  * 传入新对象会调用 `setOption(option, true)` ，修改原对象属性会调用 `setOption(option, false)`
  * 必要时可以使用 `Object.freeze(option)` 优化性能

* loading?: boolean

  调用 `echartsInstance.showLoading()` 和 `echartsInstance.hideLoading()`

* group?: string

  同 `echartsInstance.group`

* theme?: string | object

  供 `echarts.init` 使用

* lazy?: boolean | IntersectionObserverInit

  可以传入 `IntersectionObserverInit` 供惰性加载使用的 `IntersectionObserver API` 初始化使用, 为 `false` 时禁用

* autoResize?: boolean | number

  尺寸自适应重绘延迟(ms), 为 `false` 时禁用

#### Default Props
修改 VueEChartsComponent 的以下静态属性，可以改变对应的 Props 的默认值
* defaultTheme
* defaultLazy = true
* defaultAutoResize = 100

### Events
可以在组件上使用 `@click="(instance: ECharts, ...args) => void"` 代替 `echartsInstance.on('click', (...args) => void)`

#### Component Events
* @init(instance: ECharts)

  开启 `lazy load` 时 `echarts.init()` 不会在 `mounted` 同步调用，建议在该事件获取 `echartsInstance`

* @auto-resize(instance: ECharts)

  需开启 `auto resize` ，在组件自动调用 `echarts.resize()` 后触发

## Getting started
```vue
<template>
  <div class="echarts">
    <VueEChartsComponent
      :option="option"
      :loading="loading"
      @init="setOption"
      @click="handleClick"
    />
    <button @click="setOption">Random</button>
  </div>
</template>

<script lang="ts"> 
import Vue from 'vue'
import echarts, { ECharts } from 'echarts'

export Vue.extend({
  data() {
    return {
      loading: true,
      option: null,
    }
  },
  methods: {
    async setOption() {
      this.loading = true
      await new Promise(resolve => setTimeout(resolve, 500))
      this.option = {
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
            data: [
              {
                name: '男',
                value: 50,
              },
              {
                name: '女',
                value: 50,
              },
            ],
          },
        ],
      }
      this.loading = false
    },
    handleClick(instance: ECharts, params: any) {
      console.log('click')
    }
  }
})
</script>
```

## Demo
[https://dgmpk.github.io/vue-echarts-component/](https://dgmpk.github.io/vue-echarts-component/)

## License
This content is released under the [MIT](http://opensource.org/licenses/MIT) License.
