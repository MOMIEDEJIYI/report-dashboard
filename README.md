# Report Dashboard

一个基于 **Vue.js** 构建的报表展示与配置管理系统，支持多种报表类型渲染（图表、表格、汇总卡片等），并集成简单的 AI 助手功能。

### 项目结构

```bash
.
 ├─.vscode/                  # VSCode 配置
 ├─public/                   # 静态资源
 │   └─index.html            # 入口 HTML
 ├─src/
 │   ├─assets/               # 图片、图标等资源
 │   ├─components/           # Vue 组件
 │   │   ├─AI/               # AI 相关组件，AI功能需要配合Agent项目，或者直接重写请求，请根据具体情况修改
 │   │   ├─base/             # 基础通用组件（如对话框）
 │   │   ├─layout/           # 页面布局组件
 │   │   ├─report-configs/   # 报表配置组件
 │   │   └─report-types/     # 各类报表展示组件
 │   ├─config/               # 报表类型配置
 │   ├─router/               # 路由配置
 │   ├─store/                # Vuex 状态管理
 │   ├─utils/                # 工具函数（数据处理、AI 辅助等）
 │   └─views/                # 页面视图
 │       └─ReportDashboard.vue
 ├─.gitattributes
 ├─.gitignore
 ├─babel.config.js
 ├─jsconfig.json
 ├─package-lock.json
 ├─package.json
 ├─README.md
 └─vue.config.js
```



### 运行

无法运行请检查node版本

```bash
npm i
npm run serve
```



### 如何添加报表

在config文件夹中的reportTypes文件下添加报表类型，必须填写group、componentName、configComponentName；

- group相同的配置会在显示时放到同一个下拉框中；

- componentName指定了该数据显示的组件，在report-types文件夹中；

- configComponentName指定了该数据的配置项显示；

```json
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
```

##### 在report-types中添加对应的组件

组件名字要与配置的componentName相等，如果名字不对，在控制台会有相应的提示输出警告，你会见到类似

```
[ComponentMap] 组件 "summaryCard" 未找到，你可能想使用 "SummaryCard"（SummaryCard.vue）？（因为使用了大小写转换，这个情况应该不会再出现！）
```

或者

```
[ComponentMap] 组件 "summary" 未找到，无匹配建议。已注册组件有： (5) ['echartrenderer', 'summarycard', 'tablerenderer', 'unknownreport', 'suggestClosest']（可以看到这里全是小写的，所以第一种警告理应不会出现，如果你希望严格匹配，那么请在utils中的loadComponents中修改）
```

创建后添加模板（这个是SummartCard的，比较简单，所以可以直接拿来当作模板使用）：

你需要使用props: ['report']来获取第一步中配置的数据，然后就可以去展示数据了，如果要修改的话请继续下一步，我们会在配置中进行修改。

```html
<template>
  <div class="summary-card">
    <h3>{{ report.config.title }}</h3>
    <p>本月总额：￥{{ report?.data?.total ?? 'N/A' }}</p>
    <p>同比增长：{{ formatGrowth(report?.data?.growth) }}</p>
  </div>
</template>

<script>
export default {
  props: ['report'],
  methods: {
    formatGrowth(value) {
      if (typeof value !== 'number') return 'N/A'
      const sign = value >= 0 ? '+' : ''
      return `${sign}${value.toFixed(2)}%`
    }
  }
}
</script>

<style scoped>
.summary-card {
  padding: 20px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
  color: #389e0d;
}
</style>

```

#### 在report-configs中添加配置

我们需要配置去修改图表，甚至是接上对应的后端数据，我们都需要在这里做设置，一个标准的报表配置需要：

- props去接收report，我们需要它的config属性，如果你不满意也可以直接操作data
- localReport避免引用循环（避免直接操作总归是好的）
- watch监听配置的改变及时更新，如果你在配置中操作了data
- emitUpdate去更新数据

```html
<template>
  <div class="summary-config">
    <h3 class="config-title">统计卡片配置</h3>

    <div class="form-group">
      <label for="summary-title">标题</label>
      <input
        id="summary-title"
        type="text"
        v-model="localReport.config.title"
        @change="emitUpdate"
        placeholder="标题"
      />
    </div>

    <div class="form-group">
      <label for="summary-total">本月总额</label>
      <input
        id="summary-total"
        type="number"
        v-model.number="localReport.data.total"
        @change="emitUpdate"
        placeholder="本月总额"
      />
    </div>

    <div class="form-group">
      <label for="summary-growth">同比增长 (%)</label>
      <input
        id="summary-growth"
        type="number"
        v-model.number="localReport.data.growth"
        @change="emitUpdate"
        placeholder="同比增长 (%)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'SummaryCardConfig',
  props: {  
	//我们需要它的config属性
    report: {
      type: Object,
      required: true
    }
  },
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
      this.$emit('updateReport', { ...this.localReport })
    }
  }
}
</script>

<style scoped>
...
</style>

```

听起来有些不太理解，但是试一下就差不多了



#### 向AI寻求帮助

如果你有自己的AI小助手那么写入接口直接使用就行，或者你可以使用AgentKit中的cli模式进行访问。如果你想要扩展AI的功能，让它能更多的操作前端页面（你不知道页面在哪，需要跳转之类的，或者你不知道有哪些报表），agent提供了一些report报表相关插件，或许你可以试着使用一下。
