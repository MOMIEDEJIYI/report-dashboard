<template>
  <div class="report-dashboard">
    <HeaderBar @create-report="handleCreateReport" />
    <MainContent
      :rightWidth.sync="rightWidth"
    />
  </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'
import MainContent from '@/components/MainContent.vue'
import _cloneDeep from 'lodash/cloneDeep'
import { mapActions, mapMutations } from 'vuex'
import { ReportTypeDefaults } from '@/config/reportTypes'

export default {
  components: {
    HeaderBar,
    MainContent
  },
  data() {
    return {
      rightWidth: 400,
    }
  },
  methods: {
    ...mapActions(['createReport']),
    ...mapMutations(['setSelectedReportId']),
    
    async handleCreateReport(reportType) {
      const id = Date.now().toString()
      const defaults = ReportTypeDefaults[reportType.id] || {}

      const newReport = {
        id,
        type: reportType.id,
        componentName: defaults.componentName || reportType.componentName || reportType.id,
        name: `${reportType.name} ${this.$store.state.reportList.length + 1}`,
        config: _cloneDeep(defaults.config) || {},
        dataSource: {
          type: 'static',
          fields: defaults.fields || ['category', 'value'],
          url: '',
          data: _cloneDeep(defaults.data) || {}
        },
        x: (this.$store.state.reportList.length * 4) % 12,
        y: Math.floor(this.$store.state.reportList.length / 3) * 8,
        w: 4,
        h: 8,
        xGrid: (this.$store.state.reportList.length * 4) % 12,
        yGrid: Math.floor(this.$store.state.reportList.length / 3) * 8,
        wGrid: 4,
        hGrid: 8
      }
      console.log('newReport', JSON.stringify(newReport));
      await this.createReport(newReport)
      this.setSelectedReportId(id)
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
