<template>
  <div class="left-board">

    <div v-if="localReports.length" class="charts-container">
      <GridLayout
        :layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
        @layout-updated="onLayoutUpdated"
      >
        <GridItem
          v-for="report in localReports"
          :key="report.id"
          :i="report.id.toString()"
          :x="report.x"
          :y="report.y"
          :w="report.w"
          :h="report.h"
          :min-w="2"
          :min-h="4"
          class="chart-card"
          @click.native="selectReport(report.id)"
        >
          <div class="chart-header">
            <h3>{{ report.config?.title || '未命名报表' }}</h3>
          </div>
          <div class="chart-content" :ref="el => setChartRef(report.id, el)"></div>
        </GridItem>
      </GridLayout>
    </div>

    <div v-else class="empty-state">
      请从右侧选择或创建一个报表
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { GridLayout, GridItem } from 'vue-grid-layout'

export default {
  name: 'LeftBoard',
  components: { GridLayout, GridItem },
  props: {
    reports: { type: Array, default: () => [] },
    selectedReportId: String,
  },
  data() {
    return {
      localReports: [],
      chartInstances: {},
      chartRefs: {},
      layout: [],
    }
  },
  watch: {
    reports: {
      immediate: true,
      handler(newVal) {
        this.localReports = newVal.map((r, i) => ({
          ...r,
          w: r.wGrid || 4,
          h: r.hGrid || 8,
          x: r.xGrid ?? (i * 4) % 12,
          y: r.yGrid ?? Math.floor((i * 4) / 12) * 8,
        }))
        this.layout = this.localReports.map(r => ({
          i: r.id.toString(),
          x: r.x,
          y: r.y,
          w: r.w,
          h: r.h,
          minW: 2,
          minH: 4,
          static: false,
        }))
        this.$nextTick(() => {
          this.initAllCharts()
        })
      },
    },
  },
  methods: {

    setChartRef(id, el) {
      if (el) {
        this.$set(this.chartRefs, id, el)
      } else {
        this.$delete(this.chartRefs, id)
      }
    },

    initAllCharts() {
      Object.values(this.chartInstances).forEach(chart => chart.dispose())
      this.chartInstances = {}

      this.localReports.forEach(report => {
        const chartDom = this.chartRefs[report.id]
        if (chartDom) {
          const myChart = echarts.init(chartDom)
          this.chartInstances[report.id] = myChart
          this.updateChart(report)
        }
      })
    },

    updateChart(report) {
      if (!this.chartInstances[report.id]) return
      try {
        const data = this.getChartData(report)
        const measureField = report.dataSource?.fields[1] || 'value'
        const option = this.generateChartOption(report, data, measureField)
        this.chartInstances[report.id].setOption(option)
        this.chartInstances[report.id].resize()
      } catch (error) {
        console.error('图表渲染失败:', error)
        this.renderErrorChart(report.id)
      }
    },

    selectReport(reportId) {
      this.$emit('select', reportId)
    },

    onLayoutUpdated(newLayout) {
      // 更新 localReports 数据
      newLayout.forEach(item => {
        const report = this.localReports.find(r => r.id.toString() === item.i)
        if (report) {
          report.x = item.x
          report.y = item.y
          report.w = item.w
          report.h = item.h
        }
      })

      // ✨ 正确更新 layout，而不是替换
      newLayout.forEach(item => {
        const layoutItem = this.layout.find(l => l.i === item.i)
        if (layoutItem) {
          layoutItem.x = item.x
          layoutItem.y = item.y
          layoutItem.w = item.w
          layoutItem.h = item.h
        }
      })

      // 派发事件通知父组件（如果有需要）
      this.$emit(
        'update-layout',
        this.localReports.map(r => ({
          id: r.id,
          xGrid: r.x,
          yGrid: r.y,
          wGrid: r.w,
          hGrid: r.h,
        }))
      )

      // resize 所有图表
      this.localReports.forEach(r => this.chartInstances[r.id]?.resize())
    },

    generateChartOption(report, data, measureField) {
      return {
        title: { text: report.config?.title || '未命名报表', left: 'center' },
        tooltip: { trigger: 'axis' },
        legend: {
          show: report.config?.showLegend !== false,
          data: [measureField],
          bottom: 10,
        },
        dataset: { source: data },
        xAxis: {
          type: 'category',
          axisLabel: { interval: 0, rotate: 30 },
        },
        yAxis: {},
        series: [
          {
            type: report.config?.chartType || 'line',
            name: measureField,
            encode: {
              x: report.dataSource?.fields[0],
              y: report.dataSource?.fields[1],
            },
            showSymbol: true,
            smooth: true,
          },
        ],
      }
    },

    getChartData(report) {
      if (!report?.dataSource?.fields) return this.getFallbackData()
      const [dimension, measure] = report.dataSource.fields
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

    renderErrorChart(id) {
      const option = {
        title: { text: '图表加载失败', subtext: '请检查数据格式', left: 'center' },
        xAxis: { type: 'category', data: ['错误'] },
        yAxis: { type: 'value' },
        series: [
          {
            type: 'bar',
            data: [0],
            itemStyle: { color: '#ff4d4f' },
          },
        ],
      }
      this.chartInstances[id]?.setOption(option)
    },
  },
  beforeDestroy() {
    Object.values(this.chartInstances).forEach(chart => chart.dispose())
    this.chartInstances = {}
  },
}
</script>

<style scoped>
.left-board {
  height: 100%;
  position: relative;
  padding: 10px;
}

.charts-container {
  width: 100%;
  height: calc(100% - 40px);
  overflow: auto;
}

.chart-card {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  cursor: pointer;
}

.chart-header {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}

.chart-content {
  flex: 1;
  padding: 10px;
  min-height: 150px;
  box-sizing: border-box;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}
</style>
