<template>
  <div class="table-config">
    <h3 class="config-title">表格配置</h3>
    <!-- 表格标题 -->
    <div class="form-group">
      <label for="table-title">表格标题</label>
      <input
        id="table-title"
        type="text"
        v-model="localReport.config.title"
        @change="emitUpdate"
        placeholder="输入标题"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableConfig',
  props: {
    report: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      localReport: JSON.parse(JSON.stringify(this.report)),
    }
  },
  watch: {
    report: {
      handler(newVal) {
        this.localReport = JSON.parse(JSON.stringify(newVal))
      },
      immediate: true,
      deep: true,
    },
  },
  methods: {
    emitUpdate() {
      // 发出修改事件，传递修改后的副本
      this.$emit('updateReport', JSON.parse(JSON.stringify(this.localReport)))
    }
  },
}
</script>

<style scoped>
.table-config {
  padding: 16px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
}

.config-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 16px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 6px;
  color: #555;
}

input[type="text"] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.field-item {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)) auto;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
}

button {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-size: 14px;
}

button:hover {
  background-color: #2563eb;
}

button:active {
  background-color: #1d4ed8;
}

button + button {
  margin-left: 8px;
}

button.danger {
  background-color: #ef4444;
}

button.danger:hover {
  background-color: #dc2626;
}
</style>
