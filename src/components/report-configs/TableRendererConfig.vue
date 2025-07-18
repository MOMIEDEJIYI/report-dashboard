<template>
  <div class="table-config">
    <h3 class="config-title">表格配置</h3>

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

    <div class="form-group">
      <label>字段配置</label>
      <div
        class="field-item"
        v-for="(field, index) in localReport.config.fields"
        :key="index"
      >
        <input
          type="text"
          v-model="field.key"
          @change="emitUpdate"
          placeholder="字段名"
        />
        <input
          type="text"
          v-model="field.label"
          @change="emitUpdate"
          placeholder="显示名"
        />
        <button class="danger" @click="removeField(index)">删除</button>
      </div>
      <button @click="addField">添加字段</button>
    </div>

    <div class="form-group">
      <label>表格数据（预览）</label>
      <textarea
        v-model="dataInput"
        @change="handleDataInputChange"
        placeholder="输入 JSON 数组"
        rows="5"
      ></textarea>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TableConfig',
  props: {
    report: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      localReport: JSON.parse(JSON.stringify(this.report)),
      dataInput: ''
    }
  },
  watch: {
    report: {
      handler(newVal) {
        this.localReport = JSON.parse(JSON.stringify(newVal))
        this.dataInput = JSON.stringify(this.localReport.data, null, 2)
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('updateReport', { ...this.localReport })
    },
    addField() {
      if (!this.localReport.config.fields) {
        this.localReport.config.fields = []
      }
      this.localReport.config.fields.push({ key: '', label: '' })
      this.emitUpdate()
    },
    removeField(index) {
      this.localReport.config.fields.splice(index, 1)
      this.emitUpdate()
    },
    handleDataInputChange() {
      try {
        const parsed = JSON.parse(this.dataInput)
        this.localReport.data = parsed
        this.emitUpdate()
      } catch (e) {
        alert('数据格式错误，请输入合法的 JSON 数组')
      }
    }
  }
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

input[type="text"],
textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

textarea {
  font-family: monospace;
  min-height: 100px;
  resize: vertical;
}

.field-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
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
