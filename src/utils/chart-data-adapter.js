/**
 * 根据图表类型和数据字段，将原始数据转为 ECharts 所需格式
 * @param {Array} rawData - 原始数据，如：[{ month: '1月', sales: 100 }, ...]
 * @param {String} type - 图表类型，如 'line'、'pie'
 * @param {Array} fields - 数据字段：[维度字段, 指标字段]
 * @returns 适配后的数据
 */
export function transformChartData(report) {
  const type = report.config?.chartType || 'line'
  const source = report.data?.source
  const fields = report.dataSource?.fields || []

  if (!Array.isArray(source) || source.length <= 1) {
    return fallbackOption(type)
  }

  const title = report.config?.title || ''
  const showLegend = report.config?.showLegend !== false

  // 饼图处理
  if (type === 'pie') {
    const pieData = source.slice(1).map(row => ({
      name: row[0],
      value: row[1]
    }))

    return {
      title: { text: title, left: 'center' },
      tooltip: { trigger: 'item' },
      legend: {
        show: showLegend,
        orient: 'vertical',
        left: 'left'
      },
      series: [{
        type: 'pie',
        radius: '50%',
        data: pieData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }]
    }
  }

  // 折线图 / 柱状图处理
  const measure = fields[1] || source[0]?.[1]
  return {
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: {
      show: showLegend,
      data: [measure],
      bottom: 10
    },
    dataset: { source },
    xAxis: { type: 'category', axisLabel: { interval: 0, rotate: 30 } },
    yAxis: {},
    series: [{
      type: type,
      name: measure,
      encode: {
        x: fields[0] || source[0]?.[0],
        y: fields[1] || source[0]?.[1]
      },
      showSymbol: true,
      smooth: true
    }]
  }
}

function fallbackOption(type) {
  if (type === 'pie') {
    return {
      title: { text: '暂无数据', left: 'center' },
      series: [{
        type: 'pie',
        data: []
      }]
    }
  }

  return {
    title: { text: '暂无数据', left: 'center' },
    xAxis: { type: 'category' },
    yAxis: {},
    series: []
  }
}
