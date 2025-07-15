export const ReportTypeDefaults = {
  sales: {
    componentName: 'EChartRenderer', // 组件的名字
    config: {
      chartType: 'line',
      title: '销售图表',
      showLegend: true
    },
    fields: ['date', 'amount'],
    data: {
      source: [
        ['date', 'amount'],
        ['1月', 1200],
        ['2月', 1800],
        ['3月', 1500]
      ]
    }
  },
  inventory: {
    componentName: 'EChartRenderer',
    config: {
      chartType: 'bar',
      title: '库存报表',
      showLegend: true
    },
    fields: ['product', 'quantity'],
    data: {
      source: [
        ['product', 'quantity'],
        ['A类', 300],
        ['B类', 500]
      ]
    }
  },
  customer: {
    componentName: 'EChartRenderer',
    config: {
      chartType: 'pie',
      title: '客户区域',
      showLegend: true
    },
    fields: ['region', 'count'],
    data: {
      source: [
        ['region', 'count'],
        ['华北', 400],
        ['华南', 600]
      ]
    }
  },
  summary: {
    componentName: 'SummaryCard',
    config: {
      title: '本月统计'
    },
    fields: [],
    data: {
      total: 15800,
      growth: 12.5
    }
  }
}
