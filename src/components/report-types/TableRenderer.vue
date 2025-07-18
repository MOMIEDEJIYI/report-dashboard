<template>
  <div class="table-renderer">
    <h3>{{ report.config.title || '未命名表格' }}</h3>
    <table>
      <thead>
        <tr>
          <th v-for="(header, index) in headers" :key="index">{{ header }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, rowIndex) in bodyRows" :key="rowIndex">
          <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'TableRenderer',
  props: {
    report: {
      type: Object,
      required: true
    }
  },
  computed: {
    headers() {
      return this.report.data?.source?.[0] || []
    },
    bodyRows() {
      return this.report.data?.source?.slice(1) || []
    }
  }
}
</script>

<style scoped>
.table-renderer {
  padding: 10px;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
th, td {
  border: 1px solid #ddd;
  padding: 6px 10px;
}
th {
  background-color: #f0f0f0;
  font-weight: 600;
}
</style>
