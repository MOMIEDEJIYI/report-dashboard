<template>
  <div class="right-panel">
    <div class="report-list">
      <div 
        v-for="report in reports" 
        :key="report.id"
        class="report-item"
        :class="{ 'selected': report.id === selectedId }"
        @click="selectReport(report.id)"
      >
        {{ report.name }}
      </div>
    </div>
    
    <div v-if="selectedReport" class="config-form">
      <h3>报表配置</h3>
      
      <div class="form-section">
        <h4>基本信息</h4>
        <div class="form-group">
          <label>报表名称</label>
          <input v-model="selectedReport.name" @change="updateReport" />
        </div>
      </div>
      
      <div class="form-section">
        <h4>图表配置</h4>
        <div class="form-group">
          <label>图表类型</label>
          <select v-model="selectedReport.config.chartType" @change="updateReport">
            <option value="line">折线图</option>
            <option value="bar">柱状图</option>
            <option value="pie">饼图</option>
          </select>
        </div>
        
        <div class="form-group">
          <label>
            <input type="checkbox" v-model="selectedReport.config.showLegend" @change="updateReport" />
            显示图例
          </label>
        </div>
        
        <div class="form-group">
          <label>标题</label>
          <input v-model="selectedReport.config.title" @change="updateReport" />
        </div>
      </div>
      
      <div class="form-section">
        <h4>数据源配置</h4>
        <div class="form-group">
          <label>数据源类型</label>
          <select v-model="selectedReport.dataSource.type" @change="updateReport">
            <option value="static">静态数据</option>
            <option value="api">API接口</option>
          </select>
        </div>
        
        <div v-if="selectedReport.dataSource.type === 'api'" class="form-group">
          <label>API地址</label>
          <input v-model="selectedReport.dataSource.url" @change="updateReport" />
        </div>
        
        <div class="form-group">
          <label>维度字段</label>
          <input v-model="selectedReport.dataSource.fields[0]" @change="updateReport" />
        </div>
        
        <div class="form-group">
          <label>指标字段</label>
          <input v-model="selectedReport.dataSource.fields[1]" @change="updateReport" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RightPanel',
  props: {
    reports: {
      type: Array,
      required: true
    },
    selectedId: {
      type: String,
      default: null
    }
  },
  computed: {
    selectedReport() {
      const report = this.reports.find(r => r.id === this.selectedId)
      // 确保返回的report有完整结构
      return report || null
    }
  },
  methods: {
    selectReport(reportId) {
      this.$emit('select', reportId)
    },
    updateReport() {
      if (this.selectedReport) {
        // 确保dataSource.fields存在
        if (!this.selectedReport.dataSource.fields) {
          this.$set(this.selectedReport.dataSource, 'fields', ['category', 'value'])
        }
        this.$emit('update-report', this.selectedReport)
      }
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