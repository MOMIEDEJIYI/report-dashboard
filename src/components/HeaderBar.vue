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
  </div>
</template>

<script>
import { ReportTypeDefaults } from '@/config/reportTypes.js'

export default {
  name: 'HeaderBar',
  // props: {
  //   reports: {
  //     type: Array,
  //     default: () => [
  //       { id: 'sales', name: '销售报表' },
  //       { id: 'inventory', name: '库存报表' },
  //       { id: 'customer', name: '客户分析' },
  //       { id: 'summary', name: '自定义统计卡片' }
  //     ]
  //   }
  // },
  computed: {
    reports() {
      // 从配置对象的键和值构造按钮列表
      return Object.entries(ReportTypeDefaults).map(([id, cfg]) => ({
        id,
        name: cfg.name || (cfg.config && cfg.config.title) || id
      }))
    }
  },
  methods: {
    handleClick(report) {
      this.$emit('create-report', report) // 通知父组件创建报表
    }
  }
}
</script>

<style scoped>
.header-bar {
  background-color: #f5f5f5;
  padding: 10px 20px;
  border-bottom: 1px solid #ccc;
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
</style>
