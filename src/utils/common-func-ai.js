import _cloneDeep from 'lodash/cloneDeep'
import { ReportTypeDefaults } from '@/config/reportTypes'

export function exportJsonFile(data, filename = 'data.json') {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function createNewReport(reportType, reportCount) {
  const id = Date.now().toString()
  let defaults = ReportTypeDefaults[reportType.id] || {}

  defaults = JSON.parse(JSON.stringify(defaults));
  return {
    id,
    type: reportType.id,
    componentName: defaults.componentName || reportType.componentName || reportType.id,
    name: `${reportType.name} ${reportCount + 1}`,
    config: _cloneDeep(defaults.config) || {},
    data: _cloneDeep(defaults.data) || {},
    dataSource: {
      type: 'static',
      fields: defaults.fields || ['category', 'value'],
      url: ''
    },
    x: (reportCount * 4) % 12,
    y: Math.floor(reportCount / 3) * 8,
    w: 4,
    h: 8,
    xGrid: (reportCount * 4) % 12,
    yGrid: Math.floor(reportCount / 3) * 8,
    wGrid: 4,
    hGrid: 8
  }
}

export function clonePlainObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(clonePlainObject);
  }

  const res = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const val = obj[key];
      // 过滤掉函数和 Symbol 类型的值
      if (typeof val !== 'function' && typeof val !== 'symbol') {
        res[key] = clonePlainObject(val);
      }
    }
  }
  return res;
}
