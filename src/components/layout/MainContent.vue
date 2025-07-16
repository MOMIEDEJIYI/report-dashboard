<template>
  <div class="main-content">
    <div class="left-board" :style="{ width: `calc(100vw - ${rightWidth + resizerWidth}px)` }">
      <LeftBoard
        @select="handleSelect"
        @remove="handleRemoveReport"
        @reorder="handleReorderReports"
        @update-layout="handleUpdateLayout"
      />
    </div>

    <div class="resizer" @mousedown="startDragging" :style="{ width: resizerWidth + 'px' }"></div>

    <div class="right-panel" :style="{ width: rightWidth + 'px' }">
      <RightPanel
        @select="handleSelect"
        @update-report="handleUpdate"
      />
    </div>
  </div>
</template>

<script>
import { mapState, mapMutations } from 'vuex'
import LeftBoard from './LeftBoard.vue'
import RightPanel from './RightPanel.vue'

export default {
  name: 'MainContent',
  components: { LeftBoard, RightPanel },
  data() {
    return {
      isDragging: false,
      rightWidth: 400,
      resizerWidth: 5
    }
  },
  computed: {
    ...mapState(['reportList', 'selectedReportId'])
  },
  methods: {
    ...mapMutations({
      setSelectedReportId: 'setSelectedReportId',
      updateReport: 'updateReport',
      removeReport: 'removeReport',
      reorderReports: 'reorderReports',
      updateReportList: 'updateReportList'
    }),
    handleSelect(reportId) {
      this.setSelectedReportId(reportId)
    },
    handleUpdate(updatedReport) {
      this.updateReport(updatedReport)
    },
    handleRemoveReport(reportId) {
      this.removeReport(reportId)
      if (this.selectedReportId === reportId) {
        this.setSelectedReportId(null)
      }
    },
    handleReorderReports(newOrder) {
      this.reorderReports(newOrder)
    },
    handleUpdateLayout(updatedLayouts) {
      this.updateReportList(updatedLayouts)
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
      this.rightWidth = newRightWidth
    },
    stopDragging() {
      this.isDragging = false
      document.removeEventListener('mousemove', this.onDrag)
      document.removeEventListener('mouseup', this.stopDragging)
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