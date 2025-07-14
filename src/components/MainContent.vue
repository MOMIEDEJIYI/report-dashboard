<template>
  <div class="main-content">
    <div class="left-board" :style="{ width: `calc(100vw - ${rightWidth + resizerWidth}px)` }">
      <LeftBoard
        :reports="reportList"
        :selected-report-id="selectedReportId"
        @select="handleSelect"
        @remove="handleRemoveReport"
        @reorder="handleReorderReports"
        @update-layout="handleUpdateLayout"
      />
    </div>

    <div class="resizer" @mousedown="startDragging" :style="{ width: resizerWidth + 'px' }"></div>

    <div class="right-panel" :style="{ width: rightWidth + 'px' }">
      <RightPanel
        :reports="reportList"
        :selectedId="selectedReportId"
        @select="handleSelect"
        @update-report="handleUpdate"
      />
    </div>
  </div>
</template>

<script>
import LeftBoard from './LeftBoard.vue'
import RightPanel from './RightPanel.vue'

export default {
  name: 'MainContent',
  props: {
    reportList: {
      type: Array,
      required: true
    },
    selectedReportId: {
      type: [String, Number],
      default: null
    },
    rightWidth: {
      type: Number,
      default: 400
    },
    resizerWidth: {
      type: Number,
      default: 5
    }
  },
  components: { LeftBoard, RightPanel },
  data() {
    return {
      isDragging: false
    }
  },
  watch: {
    reportList(newList) {
      console.log('reportList changed:', JSON.stringify(newList))
    }
  },

  methods: {
    handleSelect(reportId) {
      this.$emit('select-report', reportId)
    },
    handleUpdate(updatedReport) {
      this.$emit('update-report', updatedReport)
    },
    startDragging() {
      this.isDragging = true
      document.addEventListener('mousemove', this.onDrag)
      document.addEventListener('mouseup', this.stopDragging)
    },
    onDrag(e) {
      if (!this.isDragging) return
      const minRight = 400
      const maxRight = 600
      let newRightWidth = window.innerWidth - e.clientX - this.resizerWidth
      newRightWidth = Math.min(Math.max(newRightWidth, minRight), maxRight)
      // 通过事件通知父组件更新 rightWidth
      this.$emit('update:rightWidth', newRightWidth)
    },
    stopDragging() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDragging)
    },
    handleRemoveReport(reportId) {
      this.$emit('remove-report', reportId)
      if (this.selectedReportId === reportId) {
        this.$emit('update:selectedReportId', null)
      }
    },
    handleReorderReports(newOrder) {
      this.$emit('reorder-reports', newOrder)
    },
    handleUpdateLayout(updatedLayouts) {
      console.log('handleUpdateLayout:', JSON.stringify(updatedLayouts));
      this.$emit('update-report-list', updatedLayouts)
    }
  }
}
</script>

<style scoped>
.main-content {
  display: flex;
  height: calc(100vh - 60px);
  overflow: hidden;
}

.left-board {
  padding: 10px;
  overflow-y: auto;
  background-color: white;
  min-width: 200px;
}

.resizer {
  cursor: ew-resize;
  background-color: #ddd;
  user-select: none;
}

.resizer:hover {
  background-color: #aaa;
}

.right-panel {
  padding: 0;
  overflow-y: hidden;
  background-color: #f9f9f9;
  min-width: 400px;
  max-width: 600px;
}
</style>