<template>
  <div class="main-content">
    <div class="left-board" :style="{ width: `calc(100vw - ${rightWidth + resizerWidth}px)` }">
      <LeftBoard :selectedReport="selectedReport" />
    </div>

    <div class="resizer" @mousedown="startDragging" :style="{ width: resizerWidth + 'px' }"></div>

    <div class="right-panel" :style="{ width: rightWidth + 'px' }">
      <RightPanel 
        :reports="reportList" 
        :selectedId="selectedReport?.id" 
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
    selectedReport: {
      type: Object,
      default: null
    }
  },
  components: { LeftBoard, RightPanel },
  data() {
    return {
      rightWidth: 400,
      resizerWidth: 5,
      isDragging: false
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