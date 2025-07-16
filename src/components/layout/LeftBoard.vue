<template>
  <div class="left-board" :style="{ '--grid-row-height': rowHeight + 'px', '--min-rows': minRows }">
    <!-- {{ localReports }} -->
    <div v-if="localReports.length" class="charts-container">
      <GridLayout
        :layout="layout"
        :col-num="12"
        :row-height="30"
        :is-draggable="true"
        :is-resizable="true"
        :vertical-compact="true"
        :use-css-transforms="true"
        @layout-updated="onLayoutUpdated"
      >
        <GridItem
          v-for="report in localReports"
          :key="report.id"
          :i="report.id.toString()"
          v-bind="getLayoutById(report.id)"
          :min-w="2"
          :min-h="4"
          class="chart-card"
          @click.native="selectReport(report.id)"
          :class="{ selected: report.id === selectedReportId }"
        >
          <div class="chart-header">
            <h3>{{ report?.name || '未命名报表' }}</h3>
            <span class="close-btn" @click.stop="removeReport(report.id)">×</span>
          </div>
          <div class="chart-content">
            <component
              :is="getReportComponent(report)"
              :report="report"
              :type="report.type"
              class="report-body"
            />
          </div>
        </GridItem>
      </GridLayout>
    </div>

    <div v-else class="empty-state">
      请选择或创建一个报表
    </div>
  </div>
</template>

<script>
import { GridLayout, GridItem } from 'vue-grid-layout'
import { mapState } from 'vuex'
import { loadComponentMap } from '@/utils/loadComponents'
import UnknownReport from '@/components/report-types/UnknownReport.vue'

const reportTypeMap = loadComponentMap(
  require.context('@/components/report-types',  false,  /[A-Z]\w+\.vue$/)
)

export default {
  name: 'LeftBoard',
  components: {
    GridLayout,
    GridItem,
  },

  data() {
    return {
      layout: [],
      rowHeight: 30,
      minRows: 4,
    }
  },

  computed: {
    ...mapState(['reportList', 'selectedReportId']),
    localReports() {
      return this.reportList
    }
  },

  mounted() {
    this.initLayout(this.localReports)
  },

  watch: {
    reportList: {
      handler(newReports) {
        this.initLayout(newReports)
      },
      deep: true
    }
  },

  methods: {
    getReportComponent(report) {
      const key = report.componentName?.toLowerCase?.()
      if (key && reportTypeMap[key]) {
        return reportTypeMap[key]
      }
      if (key) {
        reportTypeMap.suggestClosest?.(key)
      }
      return UnknownReport
    },

    selectReport(reportId) {
      this.$store.commit('setSelectedReportId', reportId)
    },

    onLayoutUpdated(newLayout) {
      const updatedLayouts = newLayout.map(item => ({
        id: item.i,
        xGrid: item.x,
        yGrid: item.y,
        wGrid: item.w,
        hGrid: item.h
      }))
      this.$store.dispatch('updateLayout', updatedLayouts)
    },

    getLayoutById(id) {
      return this.layout.find(l => l.i === id.toString()) || {}
    },

    initLayout(reports) {
      this.layout = reports.map((r, i) => {
        const x = Number.isInteger(r.x) ? r.x :
                  Number.isInteger(r.xGrid) ? r.xGrid : (i * 4) % 12
        const y = Number.isInteger(r.y) ? r.y :
                  Number.isInteger(r.yGrid) ? r.yGrid : Math.floor((i * 4) / 12) * 8
        const w = Number.isInteger(r.w) ? r.w :
                  Number.isInteger(r.wGrid) ? r.wGrid : 4
        const h = Number.isInteger(r.h) ? r.h :
                  Number.isInteger(r.hGrid) ? r.hGrid : 8

        if ([x, y, w, h].some(v => typeof v !== 'number' || isNaN(v))) {
          console.error('无效的布局值:', { id: r.id, x, y, w, h })
          return {
            i: r.id.toString(),
            x: 0, y: 0, w: 4, h: 8,
            minW: 2,
            minH: 4,
            static: false
          }
        }

        return {
          i: r.id.toString(),
          x, y, w, h,
          minW: 2,
          minH: 4,
          static: false
        }
      })
    },

    removeReport(id) {
      this.$store.commit('removeReportById', id)
      if (this.selectedReportId === id) {
        this.$store.commit('setSelectedReportId', null)
      }
    }
  }
}
</script>

<style scoped>
.left-board {
  height: 100%;
  position: relative;
  padding: 10px;
}

.charts-container {
  width: 100%;
  height: calc(100% - 40px);
  overflow: auto;
  min-height: 500px;
}

.chart-card {
  background-color: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.05);
  display: flex;
  flex-direction: column;
  cursor: default;
}

.chart-card.selected {
  border-color: #1890ff;
  box-shadow: 0 0 8px #1890ff;
}

.chart-header {
  padding: 10px 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
  font-weight: 500;
  font-size: 16px;
}
.close-btn {
  margin-left: auto;
  font-size: 16px;
  cursor: pointer;
  color: #999;
  padding: 0 5px;
  transition: color 0.2s;
}
.close-btn:hover {
  color: #f5222d;
}

.chart-content {
  flex: 1;
  padding: 10px;
  padding-right: 20px;
  padding-bottom: 20px;
  min-height: calc(var(--grid-row-height) * var(--min-rows) - 20px);
  box-sizing: border-box;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}

.vue-grid-item {
  touch-action: none;
  box-sizing: border-box;
}

.vue-resizable-handle {
  z-index: 100;
  bottom: 5px;
  right: 5px;
  width: 15px;
  height: 15px;
  background-color: #1890ff;
  border-radius: 3px;
  pointer-events: auto;
}

</style>

<style>
.left-board {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none;  /* IE 10+ */
}

.left-board::-webkit-scrollbar {
  width: 0 !important;
  height: 0 !important;
  display: none !important;
}

/* 重写 vue-grid-layout 的样式以显示绿色底纹 */
.vue-grid-placeholder {
  background: rgba(0, 255, 0, 0.3) !important;
  border: 2px dashed green !important;
}
</style>