import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

window.app = app  // 挂载到全局，方便控制台调试
