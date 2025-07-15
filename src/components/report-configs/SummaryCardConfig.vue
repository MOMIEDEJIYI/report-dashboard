<template>
  <div class="summary-config">
    <h3>统计卡片配置</h3>
    <div class="form-group">
      <label>标题</label>
      <input v-model="localReport.config.title" @change="emitUpdate" />
    </div>

    <div class="form-group">
      <label>本月总额</label>
      <input type="number" v-model.number="localReport.dataSource.data.total" @change="emitUpdate" />
    </div>

    <div class="form-group">
      <label>同比增长 (%)</label>
      <input type="number" v-model.number="localReport.dataSource.data.growth" @change="emitUpdate" />
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
  padding: 10px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
