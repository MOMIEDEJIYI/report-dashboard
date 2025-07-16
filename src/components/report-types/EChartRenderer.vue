<template>
  <div class="echart" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'
import { transformChartData } from '@/utils/chart-data-adapter'

export default {
  name: 'EChart',
  props: ['report'],
  data() {
    return {
      chart: null,
      ro: null 
    }
  },
  mounted() {
    this.$nextTick(() => {
      // 延迟一点再执行，确保父容器尺寸计算完成
      setTimeout(() => {
        const container = this.$refs.chartContainer
        if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
          this.waitForRenderThenInit()
        } else {
          this.chart = echarts.init(container)
          this.setChartOption()
          // 监听容器大小变化，避免缩小时图表超出报表显示
          this.ro = new ResizeObserver(() => {
            this.chart && this.chart.resize()
          })
          this.ro.observe(container)
        }
        window.addEventListener('resize', this.resize)
      }, 0)
    })
  },
  watch: {
    report: {
      deep: true,
      handler() {
        this.setChartOption()
      }
    }
  },
  beforeDestroy() {
    if (this.chart) {
      this.chart.dispose()
      window.removeEventListener('resize', this.resize)
    }
    if (this.ro) {
      this.ro.disconnect()
    }
  },
  methods: {
    setChartOption() {
      if (!this.chart) return
      const option = transformChartData(this.report)
      this.chart.setOption(option, true)
      this.chart.resize()
    },
    resize() {
      this.chart && this.chart.resize()
    }
  }
}
</script>

<style scoped>
.echart {
  width: 100%;
  height: 100%;
}
</style>
