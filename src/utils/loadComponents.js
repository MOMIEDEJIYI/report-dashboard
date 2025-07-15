// utils/loadComponents.js
export function loadComponentMap(context) {
  const map = {}

  const rawNames = []

  context.keys().forEach(fileName => {
    const componentConfig = context(fileName)
    const component = componentConfig.default || componentConfig
    const rawName = fileName.replace(/^\.\/(.*)\.\w+$/, '$1') // 原始文件名
    const lowerName = rawName.toLowerCase()

    map[lowerName] = component
    rawNames.push(rawName)
  })

  // 添加辅助方法：尝试推断最接近的组件名（用于调试输出）
  map.suggestClosest = function (inputName) {
    const input = inputName.toLowerCase()
    let closest = null
    let minDistance = Infinity

    for (const candidate of Object.keys(map)) {
        if (Math.abs(input.length - candidate.length) > 3) continue

        if (input[0] !== candidate[0]) continue

        const dist = levenshtein(input, candidate)
        if (dist < minDistance) {
        minDistance = dist
        closest = candidate
        }
    }

    if (minDistance <= 3 && closest) {
        const rawMatch = rawNames.find(r => r.toLowerCase() === closest)
        console.warn(`[ComponentMap] 组件 "${inputName}" 未找到，你可能想使用 "${closest}"（${rawMatch}.vue）？`)
    } else {
        console.warn(`[ComponentMap] 组件 "${inputName}" 未找到，无匹配建议。已注册组件有：`, Object.keys(map))
    }

    return closest
    }


  return map
}

function levenshtein(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const prev = Array(b.length + 1).fill(0)
  const curr = Array(b.length + 1).fill(0)

  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(
        curr[j - 1] + 1,     // 插入
        prev[j] + 1,         // 删除
        prev[j - 1] + cost   // 替换
      )
    }
    // swap
    const tmp = prev
    prev.splice(0, b.length + 1, ...curr)
    curr.splice(0, b.length + 1, ...tmp)
  }
  return prev[b.length]
}