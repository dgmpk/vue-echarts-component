const buble = require('rollup-plugin-buble')

const name = 'VueEChartsComponent'

export default {
  input: 'src/components/VueEChartsComponent/index.js',
  external: [
    'vue',
    'echarts/lib/echarts',
    'element-resize-detector',
    'lodash/debounce',
  ],
  plugins: [
    buble(),
  ],
  output: [
    {
      name,
      file: 'dist/vue-echarts-component.esm.js',
      format: 'esm',
    },
    {
      name,
      file: 'dist/vue-echarts-component.js',
      format: 'cjs',
    },
  ],
}
