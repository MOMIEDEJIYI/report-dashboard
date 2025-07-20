export const ReportTypeDefaults = {
  sales: {
    name: '销售报表',
    group: '业务报表',
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
    name: '库存报表',
    group: '业务报表',
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
    name: '客户分析',
    group: '业务报表',
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
  multiMetrics: {
    name: '销售与利润趋势',
    group: '财务报表',
    componentName: 'EChartRenderer',
    configComponentName: 'EchartRendererConfig',
    config: {
      chartType: 'line',
      title: '年度销售与利润趋势',
      showLegend: true,
      selectedMetricIndex: 1
    },
    fields: ['月份', '销售额', '利润'], // 多个指标字段
    data: {
        source: [
        ['月份', '销售额', '利润'],
        ['1月', 1200, 400],
        ['2月', 1500, 450],
        ['3月', 1700, 480],
        ['4月', 2100, 530],
        ['5月', 2600, 600],
        ['6月', 2400, 580],
        ['7月', 3000, 650],
        ['8月', 3200, 700],
        ['9月', 3100, 680],
        ['10月', 3300, 720],
        ['11月', 4000, 750],
        ['12月', 4600, 800]
      ]
    }
  },

  summary: {
    name: '运营统计',
    group: '财务报表',
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
  },
  table: {
    name: '原始表格',
    group: '数据表格',
    componentName: 'TableRenderer',
    configComponentName: 'TableRendererConfig',
    config: {
      title: '原始数据明细'
    },
    fields: [
      { key: 'name', label: '名称' },
      { key: 'amount', label: '数量' },
      { key: 'price', label: '金额' }
    ],
    data: {
      source: [
        ['名称', '数量', '金额'],
        ['商品A', 10, 120],
        ['商品B', 5, 60],
        ['商品C', 8, 80],
        ['商品D', 12, 150]
      ]
    }
  }
}

/**
 * 报表对象示例结构：
 * {
 *   id: string,
 *   type: string,
 *   componentName: string,
 *   name: string,
 *   config: object,
 *   data: {
 *     source: Array<Array<any>>
 *   },
 *   dataSource: {
 *     type: string,
 *     fields: Array<any>, || ['category', 'value'],
 *     url: string
 *   },
 *   x: number,
 *   y: number,
 *   w: number,
 *   h: number,
 *   xGrid: number,
 *   yGrid: number,
 *   wGrid: number,
 *   hGrid: number
 * }
 */
