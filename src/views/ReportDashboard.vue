<template>
  <div class="report-dashboard">
    <HeaderBar @create-report="handleCreateReport" />
    <MainContent
      :reportList="reportList"
      :selectedReportId="selectedReportId"
      :rightWidth.sync="rightWidth"
      @select-report="handleSelectReport"
      @update-report="handleUpdateReport"
      @remove-report="handleRemoveReport"
      @reorder-reports="handleReorderReports"
      @update-report-list="updateReportLayout"
    />
  </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'
import MainContent from '@/components/MainContent.vue'
import { mapActions } from 'vuex'

export default {
  components: {
    HeaderBar,
    MainContent
  },
  data() {
    return {
      selectedReport: null,
      rightWidth: 400,
    }
  },
  computed: {
    reportList() {
      return this.$store.state.reportList || []
    },
    selectedReportId() {
      return this.selectedReport ? this.selectedReport.id : null
    }
  },
  methods: {
    ...mapActions(['updateLayout', 'createReport']),
    
    async handleCreateReport(reportType) {
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
        },
        x: (this.reportList.length * 4) % 12,
        y: Math.floor(this.reportList.length / 3) * 8,
        w: 4,
        h: 8,
        xGrid: (this.reportList.length * 4) % 12,
        yGrid: Math.floor(this.reportList.length / 3) * 8,
        wGrid: 4,
        hGrid: 8
      }

      await this.createReport(newReport)
      console.log(JSON.stringify(this.reportList));
      this.selectedReport = newReport
    },

    handleSelectReport(reportId) {
      this.selectedReport = this.reportList.find(r => r.id === reportId)
    },

    handleUpdateReport(updatedReport) {
      const index = this.reportList.findIndex(r => r.id === updatedReport.id)
      if (index !== -1) {
        const newList = [...this.reportList]
        newList.splice(index, 1, updatedReport)
        this.$store.commit('setReportList', newList)
      }
    },

    handleRemoveReport(reportId) {
      const newList = this.reportList.filter(r => r.id !== reportId)
      this.$store.commit('setReportList', newList)
      if (this.selectedReport?.id === reportId) {
        this.selectedReport = null
      }
    },

    handleReorderReports(newOrder) {
      const newList = [...this.reportList].sort((a, b) => {
        return newOrder.indexOf(a.id) - newOrder.indexOf(b.id)
      })
      this.$store.commit('setReportList', newList)
    },

    updateReportLayout(updatedLayouts) {
      this.updateLayout(updatedLayouts)
    },

    getDefaultChartType(reportType) {
      const types = { sales: 'line', inventory: 'bar', customer: 'pie' }
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
  }
}
</script>
