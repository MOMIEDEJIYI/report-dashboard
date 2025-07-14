import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    reportList: []
  },
  mutations: {
    addReport(state, report) {
        // 确保新报表有完整的布局属性
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
        // console.log('addReport:', JSON.stringify(state.reportList));
    },
    updateReportLayout(state, updatedLayouts) {
        updatedLayouts.forEach(layout => {
        const report = state.reportList.find(r => r.id === layout.id)
        if (report) {
            // 同时更新所有布局相关属性
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
    }
    },
  actions: {
    updateLayout({ commit }, layouts) {
      commit('updateReportLayout', layouts)
    },
    createReport({ commit }, report) {
      commit('addReport', report)
    }
  }
})
