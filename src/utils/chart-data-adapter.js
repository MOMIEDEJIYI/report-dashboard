/**
 * 根据图表类型和数据字段，将原始数据转为 ECharts 所需格式
 * @param {Array} rawData - 原始数据，如：[{ month: '1月', sales: 100 }, ...]
 * @param {String} type - 图表类型，如 'line'、'pie'
 * @param {Array} fields - 数据字段：[维度字段, 指标字段]
 * @returns 适配后的数据
 */
export function transformChartData(report) {
  const type = report.config?.chartType || 'line';
  const source = report.data?.source;
  const fields = report.dataSource?.fields || [];

  if (!Array.isArray(source) || source.length <= 1) {
    return fallbackOption(type);
  }

  const title = report.config?.title || '';
  const showLegend = report.config?.showLegend !== false;

  if (type === 'pie') {
    const pieData = source.slice(1).map(row => ({
      name: row[0],
      value: row[1]
    }));

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
    };
  }

  // 多指标字段支持，动态生成series
  // fields[0]是维度，后面都是指标
  const metrics = fields.slice(1);
  const series = metrics.map(metric => ({
    type,
    name: metric,
    encode: {
      x: fields[0],
      y: metric
    },
    showSymbol: true,
    smooth: true
  }));

  return {
    title: { text: title, left: 'center' },
    tooltip: { trigger: 'axis' },
    legend: {
      show: showLegend,
      data: metrics,
      bottom: 10
    },
    dataset: { source },
    xAxis: { type: 'category', axisLabel: { interval: 0, rotate: 30 } },
    yAxis: {},
    series
  };
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
