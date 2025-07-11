<!-- ReportDashboard.vue -->
<template>
  <div class="report-dashboard">
    <HeaderBar @create-report="handleCreateReport" />
    <MainContent 
      :reportList="reportList" 
      :selectedReport="selectedReport"
      @select-report="handleSelectReport"
      @update-report="handleUpdateReport"
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
      
      this.reportList.push(newReport)
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