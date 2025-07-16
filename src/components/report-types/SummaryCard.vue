<template>
  <div class="summary-card">
    <h3>{{ report.config.title }}</h3>
    <p>本月总额：￥{{ report?.data?.total ?? 'N/A' }}</p>
    <p>同比增长：{{ formatGrowth(report?.data?.growth) }}</p>
  </div>
</template>

<script>
export default {
  props: ['report'],
  methods: {
    formatGrowth(value) {
      if (typeof value !== 'number') return 'N/A'
      const sign = value >= 0 ? '+' : ''
      return `${sign}${value.toFixed(2)}%`
    }
  }
}
</script>

<style scoped>
.summary-card {
  padding: 20px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #389e0d;
}
</style>
