<template>
  <div class="header-bar">
    <div class="report-buttons">
      <button
        v-for="report in reports"
        :key="report.id"
        class="report-button"
        @click="handleClick(report)"
      >
        {{ report.name }}
      </button>
    </div>
    <div class="import-export">
      <button @click="exportJson" :disabled="reportList.length === 0">导出 JSON</button>
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        @change="importJson"
        style="display:none"
      />
      <button @click="triggerFileInput">导入 JSON</button>
    </div>
  </div>
</template>

<script>
import { ReportTypeDefaults } from '@/config/reportTypes.js'
import { mapState } from 'vuex'

export default {
  name: 'HeaderBar',
  computed: {
    ...mapState(['reportList']),
    reports() {
      // 从配置对象的键和值构造按钮列表
      return Object.entries(ReportTypeDefaults).map(([id, config]) => ({
        id,
        name: config.config?.title || id
      }))
    }
  },
  methods: {
    handleClick(report) {
      this.$emit('create-report', report) // 通知父组件创建报表
    },
    exportJson() {
      const dataStr = JSON.stringify(this.reportList, null, 2)
      const blob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reports_${Date.now()}.json`
      a.click()
      URL.revokeObjectURL(url)
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    importJson(e) {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = evt => {
        try {
          const json = JSON.parse(evt.target.result)
          if (!Array.isArray(json)) {
            alert('导入文件格式不正确，应该是报表数组')
            return
          }
          // 清空原有报表（可选）
          this.$store.state.reportList = []

          // 调用 mutation 一个个添加报表
          json.forEach(report => {
            this.$store.commit('addReport', report)
          })
          alert('导入成功')
        } catch (err) {
          alert('解析JSON失败: ' + err.message)
        }
      }
      reader.readAsText(file)
      e.target.value = ''
    }
  }
}
</script>

<style scoped>
.header-bar {
  background-color: #f5f5f5;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.report-buttons {
  display: flex;
  gap: 10px;
}

.report-button {
  padding: 8px 16px;
  background-color: #409eff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.report-button:hover {
  background-color: #66b1ff;
}

.import-export > button {
  margin-left: 10px;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
  border: 1px solid #409eff;
  background-color: white;
  color: #409eff;
  transition: background-color 0.3s ease;
}

.import-export > button:hover {
  background-color: #409eff;
  color: white;
}
</style>
