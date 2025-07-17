<template>
  <div class="report-dashboard">
    <HeaderBar
      @create-report="handleCreateReport"
      @open-ai-assistant="handleOpenAI"
    />
    <MainContent :showAI="showAI" @close-ai="showAI = false"/>
  </div>
</template>

<script>
import HeaderBar from '@/components/layout/HeaderBar.vue'
import MainContent from '@/components/layout/MainContent.vue'
import { createNewReport } from '@/utils/common-func-ai'
import { mapActions, mapMutations } from 'vuex'

export default {
  components: {
    HeaderBar,
    MainContent
  },
  data() {
    return {
      showAI: false
    }
  },
  methods: {
    ...mapActions(['createReport']),
    ...mapMutations(['setSelectedReportId']),
    
    async handleCreateReport(reportType) {
      this.showAI = false
      const newReport = createNewReport(reportType, this.$store.state.reportList.length)
      console.log('newReport', JSON.stringify(newReport));
      await this.createReport(newReport)
      this.setSelectedReportId(newReport.id)
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
    handleOpenAI() {
      this.showAI = true
    }
  }
}
</script>
