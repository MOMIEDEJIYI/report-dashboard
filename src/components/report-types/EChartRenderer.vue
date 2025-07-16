<template>
  <div class="echart" ref="chartContainer"></div>
</template>

<script>
import * as echarts from 'echarts'

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
          // 尝试重试一次
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
      const option = this.getOption()
      this.chart.setOption(option)
      this.chart.resize()
    },
    getOption() {
      const type = this.report.config?.chartType || 'line'
      const title = this.report.config?.title || '未命名报表'
      const showLegend = this.report.config?.showLegend !== false
      const [dimension = '维度', measure = '指标'] = this.report.dataSource?.fields || []

      if (type === 'pie') {
        const source = this.getData().slice(1) // 排除表头
        const pieData = source.map(item => ({
          name: item[0],
          value: item[1]
        }))

        return {
          title: { text: title, left: 'center' },
          tooltip: { trigger: 'item' },
          legend: {
            show: showLegend,
            orient: 'vertical',
            left: 'left',
          },
          series: [{
            type: 'pie',
            radius: '60%',
            data: pieData,
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }]
        }
      }

      // 默认折线/柱状图配置
      return {
        title: { text: title, left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: {
          show: showLegend,
          data: [measure],
          bottom: 10,
        },
        dataset: { source: this.getData() },
        xAxis: { type: 'category', axisLabel: { interval: 0, rotate: 30 } },
        yAxis: {},
        series: [{
          type: type,
          name: measure,
          encode: {
            x: dimension,
            y: measure
          },
          showSymbol: true,
          smooth: true,
        }]
      }
    },
    getData() {
      if (!this.report?.dataSource?.fields) return this.getFallbackData()
      const [dimension, measure] = this.report.dataSource.fields
      // 模拟数据，真实业务要传入真实数据
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
