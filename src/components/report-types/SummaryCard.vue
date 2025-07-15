<template>
  <div class="summary-card">
    <h3>{{ report.config.title }}</h3>
    <p>本月总额：￥{{ getMockValue() }}</p>
    <p>同比增长：+{{ getMockValue(20) }}%</p>
  </div>
</template>

<script>
export default {
  props: ['report'],
  methods: {
    getMockValue(max = 1000) {
      return Math.floor(Math.random() * max)
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
