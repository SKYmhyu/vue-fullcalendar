// main entry file
// var Vue = require('vue')
import Vue from 'vue'
import App from './app'
import ElementUI from 'element-ui'
// import 'element-ui/lib/theme-chalk/index.css'
// new Vue({
//   el : '#app',
//   components : {
//     'app' : require('./app')
//   }
// })
Vue.use(ElementUI);

new Vue({
  el : '#app',
  render: h => h(App),
  template : '<App/>',
  components : {
    App
  }
})


