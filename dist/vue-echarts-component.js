'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var echarts = _interopDefault(require('echarts/lib/echarts'));
var elementResizeDetectorMaker = _interopDefault(require('element-resize-detector'));
var debounce = _interopDefault(require('lodash/debounce'));

var VueEChartsComponent = Vue.extend({
  name: 'VueEChartsComponent',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    option: Object,
    loading: Boolean,
    // eslint-disable-next-line vue/require-default-prop
    group: String,
    theme: { type: [Object, String], default: function () { return VueEChartsComponent.defaultTheme; } },
    lazy: { type: [Object, Boolean], default: function () { return VueEChartsComponent.defaultLazy; } },
    autoResize: { type: [Boolean, Number], default: function () { return VueEChartsComponent.defaultAutoResize; } },
  },
  mounted: function mounted() {
    var this$1 = this;

    var el = this.$el;
    var init = function () {
      var instance = this$1.instance = echarts.init(el, this$1.theme);
      this$1.$on('hook:beforeDestroy', function () { return instance.dispose(); });

      // bind listeners
      Object.keys(this$1.$listeners).forEach(function (eventName) {
        var fns = [];
        fns.concat(this$1.$listeners[eventName]).forEach(function (handler) {
          instance.on(eventName, function wrap() {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

            return handler.apply(this, [instance ].concat( args))
          });
        });
      });

      // auto resize support
      if (this$1.autoResize !== false) {
        var resize = function () {
          instance.resize();
          this$1.$emit('auto-resize', instance);
        };
        var resizeListener = debounce(resize, typeof this$1.autoResize !== 'number' ? 100 : this$1.autoResize);
        var elementResizeDetector = elementResizeDetectorMaker({ strategy: 'scroll' });
        elementResizeDetector.listenTo(el, resizeListener);

        // keep-alive support
        this$1.$on(['hook:beforeDestroy', 'hook:deactivated'], function () { return elementResizeDetector.removeListener(el, resizeListener); });
        this$1.$nextTick(function () {
          this$1.$on('hook:activated', function () {
            resize(); // mounted后会马上触发hook:activated, 需要在nextTick注册监听
            elementResizeDetector.listenTo(el, resizeListener);
          });
        });
      }
      this$1.$watch('option', function (val, oldVal) {
        if (this$1.option) {
          instance.setOption(
            // Object.freeze(option) support: use Object.freeze(option) in parent component when having a large dataset
            Object.isFrozen(this$1.option) ? clone(this$1.option) : this$1.option,
            // intelligent merge support: merge option when nested value changes inside option object
            val !== oldVal
          );
        } else {
          instance.clear();
        }
      }, { deep: true, immediate: !!this$1.option });
      this$1.$watch('group', function () { instance.group = this$1.group; }, { immediate: !!this$1.group });
      this$1.$watch('loading', function () { return instance[this$1.loading ? 'showLoading' : 'hideLoading'](); }, { immediate: this$1.loading });
      this$1.$emit('init', instance);
    };

    // lazy load support
    if (this.lazy && 'IntersectionObserver' in window) {
      var intersectionObserver = new IntersectionObserver(function (changes) {
        if (changes[0].isIntersecting || changes[0].intersectionRatio) {
          intersectionObserver.unobserve(el);
          init();
        }
      }, this.lazy === true ? {} : this.lazy);
      intersectionObserver.observe(el);
      this.$on('hook:beforeDestroy', function () { return intersectionObserver.unobserve(el); });
    } else {
      init();
    }
  },
  render: function render(h) {
    return h('div')
  },
});

VueEChartsComponent.defaultTheme = null;
VueEChartsComponent.defaultLazy = true;
VueEChartsComponent.defaultAutoResize = 100;

function clone(source) {
  var object = {};
  Object.keys(source).forEach(function (variable) {
    object[variable] = source[variable];
  });
  return object
}

module.exports = VueEChartsComponent;
