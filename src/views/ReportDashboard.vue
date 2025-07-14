<!-- ReportDashboard.vue -->
<template>
  <div class="report-dashboard">
    <HeaderBar @create-report="handleCreateReport" />
    <MainContent 
      :reportList="reportList" 
      :selectedReport="selectedReport"
      @select-report="handleSelectReport"
      @update-report="handleUpdateReport"
      @remove-report="handleRemoveReport"
      @reorder-reports="handleReorderReports"
    />
  </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'
import MainContent from '@/components/MainContent.vue'

export default {
  components: {
    HeaderBar,
    MainContent
  },
  data() {
    return {
      reportList: [], // 存储所有报表
      selectedReport: null // 当前选中的报表
    }
  },
  methods: {
    handleCreateReport(reportType) {
      const newReport = {
        id: Date.now().toString(),
        type: reportType.id,
        name: `${reportType.name} ${this.reportList.length + 1}`,
        config: {
          chartType: this.getDefaultChartType(reportType.id),
          title: `${reportType.name}报表`,
          showLegend: true
        },
        dataSource: {
          type: 'static',
          fields: this.getDefaultFields(reportType.id),
          url: ''
        }
      }
      
      this.reportList = [...this.reportList, newReport]  // 替换整个数组引用
      this.selectedReport = newReport
    },
    // 添加这个方法
    getDefaultChartType(reportType) {
      const types = {
        sales: 'line',
        inventory: 'bar',
        customer: 'pie'
      }
      return types[reportType] || 'line'
    },
    
    getDefaultFields(reportType) {
      const fields = {
        sales: ['date', 'amount'],
        inventory: ['product', 'quantity'],
        customer: ['region', 'count']
      }
      return fields[reportType] || ['category', 'value']
    },
    handleSelectReport(reportId) {
      this.selectedReport = this.reportList.find(r => r.id === reportId)
    },
    
    handleUpdateReport(updatedReport) {
      const index = this.reportList.findIndex(r => r.id === updatedReport.id)
      if (index !== -1) {
        this.$set(this.reportList, index, updatedReport)
      }
    },
    handleRemoveReport(reportId) {
      this.reportList = this.reportList.filter(r => r.id !== reportId)
      if (this.selectedReport?.id === reportId) {
        this.selectedReport = null
      }
    },
    
    handleReorderReports(newOrder) {
      // 创建新的数组而不是修改原数组
      this.reportList = [...this.reportList].sort((a, b) => {
        return newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
      })
    },
    
    getDefaultConfig(reportType) {
      // 根据不同类型返回不同的默认配置
      const configs = {
        sales: {
          chartType: 'line',
          dimensions: ['date'],
          measures: ['sales']
        },
        inventory: {
          chartType: 'bar',
          dimensions: ['product'],
          measures: ['quantity']
        },
        customer: {
          chartType: 'pie',
          dimensions: ['region'],
          measures: ['customerCount']
        }
      }
      return configs[reportType] || {}
    }
  }
}
</script>