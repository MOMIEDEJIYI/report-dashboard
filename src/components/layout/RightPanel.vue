<template>
  <div class="right-panel">
    <div v-if="selectedReport" class="config-form">
      <component
        v-if="configComponent"
        :is="configComponent"
        :report="selectedReport"
        @updateReport="updateReport"
      />
      <p v-else>未找到对应的配置组件</p>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import { loadComponentMap } from '@/utils/loadComponents'

const configComponentsMap = loadComponentMap(
  require.context('@/components/report-configs', false, /[A-Z]\w+\.vue$/)
)

export default {
  name: 'RightPanel',
  computed: {
    ...mapState(['reportList', 'selectedReportId']),

    selectedReport() {
      return this.reportList.find(r => r.id === this.selectedReportId) || null
    },
    configComponent() {
      if (!this.selectedReport) return null
      const nameKey = (
        this.selectedReport.configComponentName ||
        this.selectedReport.componentName + 'Config'
      ).toLowerCase()
      const component = configComponentsMap[nameKey]
      if (!component) configComponentsMap.suggestClosest(nameKey)

      return component || null
    }
  },
  methods: {
    selectReport(id) {
      this.$store.commit('setSelectedReportId', id)
    },
    updateReport(updatedReport) {
      this.$store.commit('updateReport', updatedReport)
    }
  }
}
</script>

<style scoped>
.right-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.report-list {
  padding: 10px;
  border-bottom: 1px solid #ddd;
  max-height: 30%;
  overflow-y: auto;
}

.report-item {
  padding: 8px 12px;
  margin-bottom: 5px;
  border-radius: 4px;
  cursor: pointer;
  background-color: #f5f5f5;
}

.report-item:hover {
  background-color: #e9e9e9;
}

.report-item.selected {
  background-color: #409eff;
  color: white;
}

.config-form {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.form-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.form-section h4 {
  margin: 0 0 15px 0;
  color: #666;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 5px;
}
</style>