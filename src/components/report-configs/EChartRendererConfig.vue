<template>
  <div>
    <h3>报表配置</h3>
    <div class="form-section">
      <h4>基本信息</h4>
      <input v-model="localReport.name" @input="emitUpdate" />
    </div>

    <div class="form-section">
      <h4>图表配置</h4>
      <select v-model="localReport.config.chartType" @change="emitUpdate">
        <option value="line">折线图</option>
        <option value="bar">柱状图</option>
        <option value="pie">饼图</option>
      </select>
      <label>
        <input type="checkbox" v-model="localReport.config.showLegend" @change="emitUpdate" />
        显示图例
      </label>
      <input v-model="localReport.config.title" @input="emitUpdate" placeholder="标题" />
    </div>

    <div class="form-section">
      <h4>数据源</h4>
      <select v-model="localReport.dataSource.type" @change="emitUpdate">
        <option value="static">静态数据</option>
        <option value="api">API接口</option>
      </select>
      <input v-if="localReport.dataSource.type==='api'" v-model="localReport.dataSource.url" @input="emitUpdate" placeholder="API地址" />
      <input v-model="localReport.dataSource.fields[0]" @input="emitUpdate" placeholder="维度字段" />
      <input v-model="localReport.dataSource.fields[1]" @input="emitUpdate" placeholder="指标字段" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'EChartRendererConfig',
  props: ['report'],
  data() {
    return {
      localReport: JSON.parse(JSON.stringify(this.report))
    }
  },
  watch: {
    report: {
      handler(newVal) {
        this.localReport = JSON.parse(JSON.stringify(newVal))
      },
      deep: true
    }
  },
  methods: {
    emitUpdate() {
      this.$emit('updateReport', this.localReport)
    }
  }
}
</script>
