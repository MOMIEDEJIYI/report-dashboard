<template>
  <div class="left-board">
    {{ reports }}
    <div v-if="reports.length" class="charts-container">
      <GridLayout
        :key="layoutKey"
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
          v-for="report in reports"
          :key="report.id"
          :i="report.id.toString()"
          v-bind="getLayoutById(report.id)"
          :min-w="2"
          :min-h="4"
          class="chart-card"
          @click.native="selectReport(report.id)"
          @resized="onItemResized"
          @resize="onItemResize"
          :class="{ selected: report.id === selectedReportId }"
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
    selectedReportId: {
      type: [String, Number],
      default: null
    },
  },
  data() {
    return {
      chartInstances: {},
      chartRefs: {},
    }
  },
  computed: {
    layout() {
      return this.reports.map((r, i) => {
        // 确保所有值都是数字且有效
        const x = Number.isInteger(r.x) ? r.x : 
                (Number.isInteger(r.xGrid) ? r.xGrid : (i * 4) % 12)
        const y = Number.isInteger(r.y) ? r.y : 
                (Number.isInteger(r.yGrid) ? r.yGrid : Math.floor((i * 4) / 12) * 8)
        const w = Number.isInteger(r.w) ? r.w : 
                (Number.isInteger(r.wGrid) ? r.wGrid : 4)
        const h = Number.isInteger(r.h) ? r.h : 
                (Number.isInteger(r.hGrid) ? r.hGrid : 8)

        // 验证所有值都是有效的数字
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
    // layoutKey() {
    //   return this.reports.map(r => `${r.id}-${r.wGrid}-${r.hGrid}`).join('|');
    // }
  },
  watch: {
    reports: {
      handler() {
        this.$nextTick(() => this.initAllCharts())
      },
      deep: true,
      immediate: true,
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

      console.log('layout:', JSON.stringify(this.layout))
      this.reports.forEach(report => {
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
    // 缩放完成
    onItemResized(i, newH, newW) {
      console.log('[Resized]', i, newW, newH);

      const updatedLayouts = this.reports.map(r => {
        if (r.id.toString() === i) {
          return {
            id: r.id,
            xGrid: r.xGrid ?? r.x ?? 0,
            yGrid: r.yGrid ?? r.y ?? 0,
            wGrid: newW,
            hGrid: newH,
          };
        } else {
          return {
            id: r.id,
            xGrid: r.xGrid ?? r.x ?? 0,
            yGrid: r.yGrid ?? r.y ?? 0,
            wGrid: r.wGrid ?? r.w ?? 4,
            hGrid: r.hGrid ?? r.h ?? 8,
          };
        }
      });

      // 触发完整 layout 更新（和拖动一样）
      this.$emit('update-layout', updatedLayouts);
    },

    // 可选：缩放过程中做一些反馈处理
    onItemResize(i, newH, newW) {
      // 可选，实时反馈
      console.log('[Resizing]', i, newW, newH);
    },
    onLayoutUpdated(newLayout) {
      console.log('newLayout from grid:', JSON.stringify(newLayout))
      this.$emit('update-layout', newLayout.map(item => ({
        id: item.i,
        xGrid: item.x,
        yGrid: item.y,
        wGrid: item.w,
        hGrid: item.h,
      })))
      this.reports.forEach(r => this.chartInstances[r.id]?.resize())
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
      return this.layout.find(l => l.i === id.toString()) || {};
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

.vue-grid-item {
  touch-action: none;
  box-sizing: border-box;
}

</style>
