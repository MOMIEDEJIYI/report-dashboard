<template>
  <div class="config-container">
    <h3 class="config-title">报表配置</h3>

    <section class="form-section">
      <h4 class="section-title">基本信息</h4>
      <div class="form-group">
        <label for="report-name">报表名称</label>
        <input id="report-name" type="text" v-model="localReport.name" @input="emitUpdate" />
      </div>
    </section>

    <section class="form-section">
      <h4 class="section-title">图表配置</h4>
      <div class="form-group">
        <label for="chart-type">图表类型</label>
        <select id="chart-type" v-model="localReport.config.chartType" @change="handleChartTypeChange">
          <option value="line">折线图</option>
          <option value="bar">柱状图</option>
          <option value="pie">饼图</option>
        </select>
      </div>

      <div class="form-group checkbox-group">
        <input id="show-legend" type="checkbox" v-model="localReport.config.showLegend" @change="emitUpdate" />
        <label for="show-legend">显示图例</label>
      </div>

      <div class="form-group">
        <label for="chart-title">标题</label>
        <input id="chart-title" type="text" v-model="localReport.config.title" @input="emitUpdate" placeholder="标题" />
      </div>
    </section>

    <section class="form-section">
      <h4 class="section-title">数据源</h4>
      <div class="form-group">
        <label for="data-source-type">数据源类型</label>
        <select id="data-source-type" v-model="localReport.dataSource.type" @change="emitUpdate">
          <option value="static">静态数据</option>
          <option value="api">API接口</option>
        </select>
      </div>

      <div class="form-group" v-if="localReport.dataSource.type === 'api'">
        <label for="api-url">API地址</label>
        <input id="api-url" type="text" v-model="localReport.dataSource.url" @input="emitUpdate" placeholder="API地址" />
        <button @click="fetchApiData" style="margin-top: 8px;">拉取数据</button>
    </div>

      <div class="form-group">
        <label for="dimension-field">维度字段</label>
        <select
          id="dimension-field"
          v-model="localReport.dataSource.fields[0]"
          @change="emitUpdate"
        >
          <option
            v-for="(field, index) in localReport.data?.source?.[0] || []"
            :key="index"
            :value="field"
          >
            {{ field }}
          </option>
        </select>
      </div>
      
      <div class="form-group" v-if="localReport.config.chartType === 'pie' && localReport.dataSource.fields.length > 2">
        <label for="metric-select">饼图指标</label>
        <select id="metric-select" v-model="localReport.config.selectedMetricIndex" @change="emitUpdate">
          <option v-for="(field, idx) in localReport.dataSource.fields.slice(1)" :key="idx" :value="idx + 1">
            {{ field }}
          </option>
        </select>
      </div>
      <div v-else class="form-group">
        <label for="metric-field">指标字段</label>
        <input id="metric-field" type="text" v-model="localReport.dataSource.fields[1]" @input="emitUpdate" placeholder="指标字段" />
      </div>
    </section>
  </div>
</template>

<script>
export default {
  name: 'EChartRendererConfig',
  props: ['report'],
  data() {
    return {
      localReport: JSON.parse(JSON.stringify(this.report))
    }
  },
  watch: {
    report: {
      handler(newVal) {
        this.localReport = JSON.parse(JSON.stringify(newVal))
      },
      deep: true
    }
  },
  methods: {
    handleChartTypeChange(e) {
      const newType = e.target.value
      this.localReport.config.chartType = newType

      if (newType === 'pie') {
        const fields = this.localReport.dataSource?.fields || []
        // 默认选择第一个指标（即 fields[1]，索引为1）
        if (!this.localReport.config.selectedMetricIndex || fields.length <= this.localReport.config.selectedMetricIndex) {
          this.localReport.config.selectedMetricIndex = 1
        }
      } else {
        // 非饼图就可以不使用 selectedMetricIndex
        delete this.localReport.config.selectedMetricIndex
      }

      this.emitUpdate()
    },
    emitUpdate() {
      this.$emit('updateReport', this.localReport)
    },
    async fetchApiData() {
      const url = this.localReport.dataSource.url
      if (!url) {
        alert('请先填写API地址')
        return
      }
      try {
        const res = await fetch(url)
        if (!res.ok) throw new Error(`请求失败，状态码: ${res.status}`)
        const data = await res.json()
        this.localReport.data = this.localReport.data || {}
        this.localReport.data.source = data

        // 触发配置更新，通知父组件更新数据
        this.emitUpdate()
        alert('数据更新成功')
      } catch (err) {
        alert('拉取数据失败: ' + err.message)
      }
    }
  }
}
</script>

<style scoped>
.config-container {
  padding: 20px;
  background-color: #fff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0,0,0,0.05);
  max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #333;
}

.config-title {
  margin-bottom: 20px;
  font-weight: 600;
  font-size: 1.5rem;
  color: #2c3e50;
}

.form-section {
  margin-bottom: 25px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
}

.section-title {
  margin-bottom: 15px;
  font-weight: 600;
  font-size: 1.1rem;
  color: #34495e;
  border-left: 4px solid #409eff;
  padding-left: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 15px;
}

.form-group label {
  font-weight: 500;
  margin-bottom: 6px;
  font-size: 0.9rem;
  color: #555;
}

.form-group input[type="text"],
.form-group select {
  padding: 8px 10px;
  font-size: 1rem;
  border: 1px solid #ccd6eb;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group select:focus {
  border-color: #409eff;
  outline: none;
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
}

.checkbox-group input[type="checkbox"] {
  margin-right: 8px;
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.checkbox-group label {
  cursor: pointer;
  font-weight: 500;
  font-size: 0.95rem;
}
</style>
