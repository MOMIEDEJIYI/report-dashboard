export const ReportTypeDefaults = {
  sales: {
    componentName: 'EChartRenderer',
    configComponentName: 'EchartRendererConfig',
    config: {
      chartType: 'line',
      title: '年度销售趋势',
      showLegend: true
    },
    fields: ['月份', '销售额'],
    data: {
      source: [
        ['月份', '销售额'],
        ['1月', 1200],
        ['2月', 1500],
        ['3月', 1700],
        ['4月', 2100],
        ['5月', 2600],
        ['6月', 2400],
        ['7月', 3000],
        ['8月', 3200],
        ['9月', 3100],
        ['10月', 3300],
        ['11月', 4000],
        ['12月', 4600]
      ]
    }
  },

  inventory: {
    componentName: 'EChartRenderer',
    configComponentName: 'EchartRendererConfig',
    config: {
      chartType: 'bar',
      title: '各仓库库存情况',
      showLegend: true
    },
    fields: ['仓库', '库存数量'],
    data: {
      source: [
        ['仓库', '库存数量'],
        ['北京仓', 800],
        ['上海仓', 650],
        ['广州仓', 1000],
        ['成都仓', 700],
        ['武汉仓', 580]
      ]
    }
  },

  customer: {
    componentName: 'EChartRenderer',
    configComponentName: 'EchartRendererConfig',
    config: {
      chartType: 'pie',
      title: '客户地区分布',
      showLegend: true
    },
    fields: ['地区', '客户数'],
    data: {
      source: [
        ['地区', '客户数'],
        ['华东', 1200],
        ['华南', 800],
        ['华北', 600],
        ['西南', 500],
        ['东北', 300],
        ['西北', 200]
      ]
    }
  },

  summary: {
    componentName: 'SummaryCard',
    configComponentName: 'SummaryCardConfig',
    config: {
      title: '本月运营统计'
    },
    fields: [],
    data: {
      total: 38200,
      growth: 8.3
    }
  }
}
