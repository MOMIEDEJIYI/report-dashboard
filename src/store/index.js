import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    reportList: [],
    selectedReportId: null,
  },

  mutations: {
    addReport(state, report) {
      const newReport = {
        ...report,
        x: report.x || report.xGrid || (state.reportList.length * 4) % 12,
        y: report.y || report.yGrid || Math.floor(state.reportList.length / 3) * 8,
        w: report.w || report.wGrid || 4,
        h: report.h || report.hGrid || 8,
        xGrid: report.xGrid || report.x || (state.reportList.length * 4) % 12,
        yGrid: report.yGrid || report.y || Math.floor(state.reportList.length / 3) * 8,
        wGrid: report.wGrid || report.w || 4,
        hGrid: report.hGrid || report.h || 8
      }
      state.reportList = [...state.reportList, newReport]
    },

    updateReportLayout(state, updatedLayouts) {
      updatedLayouts.forEach(layout => {
        const report = state.reportList.find(r => r.id === layout.id)
        if (report) {
          report.x = layout.xGrid
          report.y = layout.yGrid
          report.w = layout.wGrid
          report.h = layout.hGrid
          report.xGrid = layout.xGrid
          report.yGrid = layout.yGrid
          report.wGrid = layout.wGrid
          report.hGrid = layout.hGrid
        }
      })
    },
    setSelectedReportId(state, id) {
      state.selectedReportId = id
    },
    removeReportById(state, id) {
        state.reportList = state.reportList.filter(r => r.id !== id)
    },
    updateReport(state, updatedReport) {
      const idx = state.reportList.findIndex(r => r.id === updatedReport.id)
      if (idx !== -1) {
        Vue.set(state.reportList, idx, { ...updatedReport })
      }
    },
    removeReport(state, id) {
      state.reportList = state.reportList.filter(r => r.id !== id)
    },
    reorderReports(state, newOrder) {
      state.reportList = [...newOrder]
    },
    updateReportList(state, updatedLayouts) {
      updatedLayouts.forEach(layout => {
        const r = state.reportList.find(report => report.id === layout.id)
        if (r) {
          Object.assign(r, layout)
        }
      })
    }
  },

  actions: {
    updateLayout({ commit }, layouts) {
      commit('updateReportLayout', layouts)
    },
    updateReport({ commit }, report) {
      commit('updateReport', report)
    },
    createReport({ commit }, report) {
      console.log('report:', report);
      console.log('report keys:', Object.keys(report));
      commit('addReport', report)
    }
  }
})
