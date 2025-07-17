<template>
  <div class="header-bar">
    <div class="report-buttons">
      <div
        v-for="(groupReports, groupName) in groupedReports"
        :key="groupName"
        class="report-group"
      >
        <span class="group-title">{{ groupName }}</span>
        <div class="dropdown-menu">
          <button
            v-for="report in groupReports"
            :key="report.id"
            class="report-button"
            @click="handleClick(report)"
          >
            {{ report.name }}
          </button>
        </div>
      </div>
      <div class="ai-assistant" @click="handleAIClick" title="点击打开 AI 助手">
        小助手
      </div>
    </div>
    <div class="import-export">
      <button @click="exportJson" :disabled="reportList.length === 0">导出 JSON</button>
      <input
        ref="fileInput"
        type="file"
        accept=".json,application/json"
        @change="handleFileSelected"
        style="display:none"
      />
      <button @click="triggerFileInput">导入 JSON</button>
    </div>

    <ConfirmDialog
      :visible="showConfirm"
      message="当前已有报表，导入将覆盖原有数据，是否确认？"
      @confirm="confirmImport"
      @cancel="cancelImport"
    />
  </div>
</template>

<script>
import { ReportTypeDefaults } from '@/config/reportTypes.js'
import { mapState } from 'vuex'
import utils from '@/utils/index.js';
import ConfirmDialog from '@/components/base/ConfirmDialog.vue'

export default {
  name: 'HeaderBar',
  components: { ConfirmDialog },
  computed: {
    ...mapState(['reportList']),
    groupedReports() {
      const groups = {}
      Object.entries(ReportTypeDefaults).forEach(([id, config]) => {
        const group = config.group || '未分组'
        if (!groups[group]) groups[group] = []
        groups[group].push({
          id,
          name: config.config?.title || id
        })
      })
      return groups
    }
  },
  data() {
    return {
      showConfirm: false,
      pendingFile: null
    }
  },
  methods: {
    handleAIClick() {
      this.$emit('open-ai-assistant') // 触发父组件事件，或者你自己写具体逻辑
    },
    handleClick(report) {
      this.$emit('create-report', report) // 通知父组件创建报表
    },
    exportJson() {
      utils.exportJsonFile(this.reportList, `reports_${Date.now()}.json`)
    },
    triggerFileInput() {
      this.$refs.fileInput.click()
    },
    handleFileSelected(e) {
      const file = e.target.files[0]
      if (!file) return
      this.pendingFile = file

      // 有内容时弹出提示
      if (this.reportList.length > 0) {
        this.showConfirm = true
      } else {
        this.readAndImport(file)
      }

      e.target.value = ''
    },
    cancelImport() {
      this.showConfirm = false
      this.pendingFile = null
    },
    confirmImport() {
      this.showConfirm = false
      if (this.pendingFile) {
        this.readAndImport(this.pendingFile)
        this.pendingFile = null
      }
    },
    readAndImport(file) {
      const reader = new FileReader()
      reader.onload = evt => {
        try {
          const json = JSON.parse(evt.target.result)
          if (!Array.isArray(json)) {
            alert('导入文件格式不正确，应该是报表数组')
            return
          }
          this.$store.state.reportList = []
          json.forEach(report => {
            this.$store.commit('addReport', report)
          })
        } catch (err) {
          alert('解析JSON失败: ' + err.message)
        }
      }
      reader.readAsText(file)
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
          // 清空原有报表
          this.$store.state.reportList = []
          // 调用 mutation 一个个添加报表
          json.forEach(report => {
            this.$store.commit('addReport', report)
          })
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
  align-items: center;
  gap: 16px;
  max-height: 40px;
}
.report-group {
  position: relative;
  display: inline-block;
  margin-right: 16px;
}
.group-title {
  position: relative;
  cursor: pointer;
  padding: 6px 12px;
  background-color: #409eff;
  color: white;
  border-radius: 4px;
  user-select: none;
  display: inline-block;
}

.dropdown-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  border-radius: 4px;
  padding: 8px 12px;
  z-index: 1000;
  min-width: 160px;
  white-space: nowrap;
}

/* 悬浮显示弹层 */
.report-group:hover .dropdown-menu {
  display: block;
}

/* 弹层内按钮垂直排列 */
.dropdown-menu .report-button {
  display: block;
  width: 100%;
  margin-bottom: 6px;
  background-color: transparent;
  color: #333;
  text-align: left;
  padding: 6px 8px;
  border-radius: 3px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-menu .report-button:hover {
  background-color: #f0f5ff;
  color: #409eff;
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

.ai-assistant {
  padding: 6px 12px;
  background-color: #67c23a;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  user-select: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
}

.ai-assistant:hover {
  background-color: #85ce5b;
}
</style>
