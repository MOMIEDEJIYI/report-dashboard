<template>
  <div class="left-board" :style="{ '--grid-row-height': rowHeight + 'px', '--min-rows': minRows }">
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
          v-bind="getLayoutById(report.id)"
          :min-w="2"
          :min-h="4"
          class="chart-card"
          @click.native="selectReport(report.id)"
          :class="{ selected: report.id === selectedReportId }"
        >
          <div class="chart-header">
            <h3>{{ report.config?.title || '未命名报表' }}</h3>
            <span class="close-btn" @click.stop="removeReport(report.id)">×</span>
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
import { mapState } from 'vuex'

export default {
  name: 'LeftBoard',
  components: { GridLayout, GridItem },

  data() {
    return {
      chartInstances: {},
      chartRefs: {},
      layout: [],
      rowHeight: 30,
      minRows: 4,
    }
  },

  computed: {
    ...mapState(['reportList', 'selectedReportId']),
    localReports() {
      return this.reportList
    }
  },

  mounted() {
    this.initLayout(this.localReports)
    this.$nextTick(() => this.initAllCharts())
  },

  watch: {
    reportList: {
      handler(newReports) {
        this.initLayout(newReports)
        this.$nextTick(() => this.initAllCharts())
      },
      deep: true
    }
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
      this.$store.commit('setSelectedReportId', reportId)
    },

    onLayoutUpdated(newLayout) {
      // 直接调用 action 更新 Vuex 状态，不在这里修改 localReports
      const updatedLayouts = newLayout.map(item => ({
        id: item.i,
        xGrid: item.x,
        yGrid: item.y,
        wGrid: item.w,
        hGrid: item.h
      }))

      this.$store.dispatch('updateLayout', updatedLayouts)

      this.$nextTick(() => {
        this.localReports.forEach(r => this.chartInstances[r.id]?.resize())
      })
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

    getLayoutById(id) {
      return this.layout.find(l => l.i === id.toString()) || {}
    },

    initLayout(reports) {
      this.layout = reports.map((r, i) => {
        const x = Number.isInteger(r.x) ? r.x :
                  Number.isInteger(r.xGrid) ? r.xGrid : (i * 4) % 12
        const y = Number.isInteger(r.y) ? r.y :
                  Number.isInteger(r.yGrid) ? r.yGrid : Math.floor((i * 4) / 12) * 8
        const w = Number.isInteger(r.w) ? r.w :
                  Number.isInteger(r.wGrid) ? r.wGrid : 4
        const h = Number.isInteger(r.h) ? r.h :
                  Number.isInteger(r.hGrid) ? r.hGrid : 8

        if ([x, y, w, h].some(v => typeof v !== 'number' || isNaN(v))) {
          console.error('无效的布局值:', { id: r.id, x, y, w, h })
          return {
            i: r.id.toString(),
            x: 0, y: 0, w: 4, h: 8,
            minW: 2,
            minH: 4,
            static: false
          }
        }

        return {
          i: r.id.toString(),
          x, y, w, h,
          minW: 2,
          minH: 4,
          static: false
        }
      })
    },
    removeReport(id) {
      this.$store.commit('removeReportById', id)
      if (this.selectedReportId === id) {
        this.$store.commit('setSelectedReportId', null)
      }
      this.$nextTick(() => {
        this.initLayout(this.localReports)
        this.initAllCharts()
      })
    }

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
  min-height: 500px;
}

.chart-card {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
  display: flex;
  flex-direction: column;
  cursor: default;
}

.chart-card.selected {
  border-color: #1890ff;
  box-shadow: 0 0 8px #1890ff;
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
.close-btn {
  margin-left: auto;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  padding: 0 5px;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #f5222d;
}

.chart-content {
  flex: 1;
  padding: 10px;
  padding-right: 20px;
  padding-bottom: 20px;
  min-height: calc(var(--grid-row-height) * var(--min-rows) - 20px);
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

.vue-grid-item {
  touch-action: none;
  box-sizing: border-box;
}

.vue-resizable-handle {
  z-index: 100;
  bottom: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  background-color: #1890ff;
  border-radius: 3px;
  pointer-events: auto;
}
</style>

<style>
.left-board {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}

.left-board::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

/* 重写 vue-grid-layout 的样式以显示绿色底纹 */
.vue-grid-placeholder {
  background: rgba(0, 255, 0, 0.3) !important;
  border: 2px dashed green !important;
}
</style>