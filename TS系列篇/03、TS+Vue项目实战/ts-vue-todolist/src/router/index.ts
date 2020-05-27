import Vue from 'vue'
import VueRouter from 'vue-router'
import todoList from '../views/todoList.vue'
import todoListVuex from '../views/todoList-with-vuex.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'todoList',
    component: todoList
  },
  {
    path: '/vuex',
    name: 'todoListVuex',
    component: todoListVuex
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
