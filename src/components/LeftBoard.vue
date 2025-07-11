<template>
  <div class="left-board">
    <div v-if="selectedReport" class="chart-container">
      <div ref="chart" style="width: 100%; height: 100%;"></div>
    </div>
    <div v-else class="empty-state">
      请从右侧选择或创建一个报表
    </div>
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'LeftBoard',
  props: {
    selectedReport: {
      type: Object,
      default: null,
      validator: (value) => {
        return !value || (
          value.dataSource && 
          Array.isArray(value.dataSource.fields) &&
          value.dataSource.fields.length >= 2
        )
      }
    }
  },
  data() {
    return {
      chartInstance: null
    }
  },
  watch: {
    selectedReport: {
      immediate: true,
      deep: true, // 添加深度监听
      handler(newVal) {
        this.$nextTick(() => {
          if (newVal) {
            this.initChart()
          } else if (this.chartInstance) {
            this.chartInstance.dispose()
            this.chartInstance = null
          }
        })
      }
    }
  },
  methods: {
    initChart() {
      this.$nextTick(() => {
        if (!this.selectedReport || !this.$refs.chart) {
          console.log('初始化条件不满足')
          return
        }
        
        console.log('初始化图表...')
        
        if (this.chartInstance) {
          this.chartInstance.dispose()
        }
        
        try {
          this.chartInstance = echarts.init(this.$refs.chart)
          this.updateChart()
          window.addEventListener('resize', this.handleResize)
          console.log('图表初始化成功')
        } catch (error) {
          console.error('图表初始化失败:', error)
        }
      })
    },
    
    updateChart() {
      if (!this.chartInstance || !this.selectedReport) return
      
      try {
        const data = this.getChartData()
        const measureField = this.selectedReport.dataSource.fields[1] || 'value'
        
        const option = {
          title: {
            text: this.selectedReport.config?.title || '未命名报表',
            left: 'center'
          },
          tooltip: {
            trigger: 'axis'
          },
          legend: {
            show: this.selectedReport.config?.showLegend !== false,
            data: [measureField], // 使用数据源中的指标字段名
            bottom: 10
          },
          dataset: {
            source: data
          },
          xAxis: { 
            type: 'category',
            axisLabel: {
              interval: 0,
              rotate: 30
            }
          },
          yAxis: {},
          series: [{
            type: this.selectedReport.config?.chartType || 'line',
            name: measureField, // 添加系列名称
            encode: {
              x: this.selectedReport.dataSource.fields[0],
              y: this.selectedReport.dataSource.fields[1]
            },
            showSymbol: true
          }]
        }
        
        this.chartInstance.setOption(option)
      } catch (error) {
        console.error('图表渲染失败:', error)
        this.renderErrorChart()
      }
    },
    
    generateChartOption() {
      const data = this.getChartData()
      
      return {
        title: {
          text: this.selectedReport.config?.title || '未命名报表',
          left: 'center'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          show: this.selectedReport.config?.showLegend !== false,
          data: [this.selectedReport.dataSource.fields[1]],
          bottom: 10
        },
        dataset: {
          source: data
        },
        xAxis: { 
          type: 'category',
          axisLabel: {
            interval: 0,
            rotate: 30
          }
        },
        yAxis: {},
        series: [{
          type: this.selectedReport.config?.chartType || 'line',
          encode: {
            x: this.selectedReport.dataSource.fields[0],
            y: this.selectedReport.dataSource.fields[1]
          },
          showSymbol: true,
          smooth: true
        }]
      }
    },
    
    getChartData() {
      if (!this.selectedReport?.dataSource?.fields) {
        return this.getFallbackData()
      }
      
      const [dimension, measure] = this.selectedReport.dataSource.fields
      const data = [
        [dimension, measure], // 表头
        [dimension + '1', Math.round(Math.random() * 100)],
        [dimension + '2', Math.round(Math.random() * 100)],
        [dimension + '3', Math.round(Math.random() * 100)],
        [dimension + '4', Math.round(Math.random() * 100)],
        [dimension + '5', Math.round(Math.random() * 100)]
      ]
      
      return data
    },
    
    getFallbackData() {
      return [
        ['月份', '销售额'],
        { 月份: '1月', 销售额: 100 },
        { 月份: '2月', 销售额: 200 },
        { 月份: '3月', 销售额: 150 },
        { 月份: '4月', 销售额: 180 },
        { 月份: '5月', 销售额: 210 }
      ]
    },
    
    renderErrorChart() {
      const option = {
        title: {
          text: '图表加载失败',
          subtext: '请检查数据格式',
          left: 'center'
        },
        xAxis: { 
          type: 'category',
          data: ['错误']
        },
        yAxis: { type: 'value' },
        series: [{
          type: 'bar',
          data: [0],
          itemStyle: {
            color: '#ff4d4f'
          }
        }]
      }
      this.chartInstance.setOption(option)
    },
    
    handleResize() {
      if (this.chartInstance) {
        this.chartInstance.resize()
      }
    }
  },
  beforeDestroy() {
    if (this.chartInstance) {
      this.chartInstance.dispose()
      window.removeEventListener('resize', this.handleResize)
    }
  }
}
</script>

<style scoped>
.left-board {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
}

.chart-container {
  flex: 1;
  min-height: 300px;
  border: 1px solid #eee;
  border-radius: 4px;
  background-color: #fff;
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