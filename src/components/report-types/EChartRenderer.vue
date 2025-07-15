<template>
  <div class="echart" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EChart',
  props: ['report'],
  data() {
    return { chart: null }
  },
  mounted() {
    this.chart = echarts.init(this.$refs.chartContainer)
    this.setChartOption()
    window.addEventListener('resize', this.resize)
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
  },
  methods: {
    setChartOption() {
      if (!this.chart) return
      const option = this.getOption()
      this.chart.setOption(option)
      this.chart.resize()
    },
    getOption() {
      const measure = this.report.dataSource?.fields?.[1] || 'value'
      return {
        title: { text: this.report.config?.title || '未命名报表', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: {
          show: this.report.config?.showLegend !== false,
          data: [measure],
          bottom: 10,
        },
        dataset: { source: this.getData() },
        xAxis: { type: 'category', axisLabel: { interval: 0, rotate: 30 } },
        yAxis: {},
        series: [{
          type: this.report.config?.chartType || 'line',
          name: measure,
          encode: {
            x: this.report.dataSource?.fields?.[0],
            y: this.report.dataSource?.fields?.[1]
          },
          showSymbol: true,
          smooth: true,
        }]
      }
    },
    getData() {
      if (!this.report?.dataSource?.fields) return this.getFallbackData()
      const [dimension, measure] = this.report.dataSource.fields
      // 模拟数据，真实业务请传入真实数据
      return [
        [dimension, measure],
        [dimension + '1', Math.round(Math.random() * 100)],
        [dimension + '2', Math.round(Math.random() * 100)],
        [dimension + '3', Math.round(Math.random() * 100)],
        [dimension + '4', Math.round(Math.random() * 100)],
        [dimension + '5', Math.round(Math.random() * 100)],
      ]
    },
    getFallbackData() {
      return [
        ['月份', '销售额'],
        ['1月', 100],
        ['2月', 200],
        ['3月', 150],
        ['4月', 180],
        ['5月', 210],
      ]
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
