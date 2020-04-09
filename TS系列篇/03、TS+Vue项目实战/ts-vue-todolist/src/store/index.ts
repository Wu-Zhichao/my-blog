import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)
interface State{
  todoList: any
}
const state:State = {
  todoList: []
}
const mutations = {
  setTodoList(state:State,data:any) {
    state.todoList.push(data)
  },
  updateTodoList(state:State,index:number) {
    state.todoList.splice(index,1)
  }
}
export default new Vuex.Store({
  state,
  mutations
})
