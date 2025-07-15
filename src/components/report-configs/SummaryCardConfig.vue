<template>
  <div class="summary-config">
    <h3 class="config-title">统计卡片配置</h3>

    <div class="form-group">
      <label for="summary-title">标题</label>
      <input
        id="summary-title"
        type="text"
        v-model="localReport.config.title"
        @change="emitUpdate"
        placeholder="标题"
      />
    </div>

    <div class="form-group">
      <label for="summary-total">本月总额</label>
      <input
        id="summary-total"
        type="number"
        v-model.number="localReport.dataSource.data.total"
        @change="emitUpdate"
        placeholder="本月总额"
      />
    </div>

    <div class="form-group">
      <label for="summary-growth">同比增长 (%)</label>
      <input
        id="summary-growth"
        type="number"
        v-model.number="localReport.dataSource.data.growth"
        @change="emitUpdate"
        placeholder="同比增长 (%)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryCardConfig',
  props: {
    report: {
      type: Object,
      required: true
    }
  },
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
    emitUpdate() {
      this.$emit('updateReport', { ...this.localReport })
    }
  }
}
</script>

<style scoped>
.summary-config {
  padding: 20px;
  background: #fff;
  border-radius: 6px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
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

.form-group {
  display: flex;
  flex-direction: column;
  margin-bottom: 18px;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 1rem;
  color: #555;
}

.form-group input {
  padding: 8px 10px;
  font-size: 1rem;
  border: 1px solid #ccd6eb;
  border-radius: 4px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  border-color: #409eff;
  outline: none;
}
</style>
