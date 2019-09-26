import Vue from 'vue'
import echarts from 'echarts/lib/echarts'
import elementResizeDetectorMaker from 'element-resize-detector'
import debounce from 'lodash/debounce'

const VueEChartsComponent = Vue.extend({
  name: 'VueEChartsComponent',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    option: Object,
    loading: Boolean,
    // eslint-disable-next-line vue/require-default-prop
    group: String,
    theme: { type: [Object, String], default: () => VueEChartsComponent.defaultTheme },
    lazy: { type: [Object, Boolean], default: () => VueEChartsComponent.defaultLazy },
    autoResize: { type: [Boolean, Number], default: () => VueEChartsComponent.defaultAutoResize },
  },
  mounted() {
    const el = this.$el
    const init = () => {
      const instance = this.instance = echarts.init(el, this.theme)
      this.$on('hook:beforeDestroy', () => instance.dispose())

      // bind listeners
      Object.keys(this.$listeners).forEach(eventName => {
        const fns = []
        fns.concat(this.$listeners[eventName]).forEach((handler) => {
          instance.on(eventName, function wrap(...args) {
            return handler.apply(this, [instance, ...args])
          })
        })
      })

      // auto resize support
      if (this.autoResize !== false) {
        const resize = () => {
          instance.resize()
          this.$emit('auto-resize', instance)
        }
        const resizeListener = debounce(resize, typeof this.autoResize !== 'number' ? 100 : this.autoResize)
        const elementResizeDetector = elementResizeDetectorMaker({ strategy: 'scroll' })
        elementResizeDetector.listenTo(el, resizeListener)

        // keep-alive support
        this.$on(['hook:beforeDestroy', 'hook:deactivated'], () => elementResizeDetector.removeListener(el, resizeListener))
        this.$nextTick(() => {
          this.$on('hook:activated', () => {
            resize() // mounted后会马上触发hook:activated, 需要在nextTick注册监听
            elementResizeDetector.listenTo(el, resizeListener)
          })
        })
      }
      this.$watch('option', (val, oldVal) => {
        if (this.option) {
          instance.setOption(
            // Object.freeze(option) support: use Object.freeze(option) in parent component when having a large dataset
            Object.isFrozen(this.option) ? clone(this.option) : this.option,
            // intelligent merge support: merge option when nested value changes inside option object
            val !== oldVal,
          )
        } else {
          instance.clear()
        }
      }, { deep: true, immediate: !!this.option })
      this.$watch('group', () => { instance.group = this.group }, { immediate: !!this.group })
      this.$watch('loading', () => instance[this.loading ? 'showLoading' : 'hideLoading'](), { immediate: this.loading })
      this.$emit('init', instance)
    }

    // lazy load support
    if (this.lazy && 'IntersectionObserver' in window) {
      const intersectionObserver = new IntersectionObserver((changes) => {
        if (changes[0].isIntersecting || changes[0].intersectionRatio) {
          intersectionObserver.unobserve(el)
          init()
        }
      }, this.lazy === true ? {} : this.lazy)
      intersectionObserver.observe(el)
      this.$on('hook:beforeDestroy', () => intersectionObserver.unobserve(el))
    } else {
      init()
    }
  },
  render(h) {
    return h('div')
  },
})

VueEChartsComponent.defaultTheme = null
VueEChartsComponent.defaultLazy = true
VueEChartsComponent.defaultAutoResize = 100

export default VueEChartsComponent

function clone(source) {
  const object = {}
  Object.keys(source).forEach(variable => {
    object[variable] = source[variable]
  })
  return object
}
