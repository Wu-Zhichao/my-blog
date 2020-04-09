<template>
  <div class="todo-list">
    <div class="nav">
      <a-input placeholder="please input todo" v-model="inputValue"/>
      <a-button type="primary" @click="addTodoItem">添加</a-button>
    </div>
    <ul class="list">
      <todo-item
       v-for="(item,index) in todoList" 
       :key="index"
       :item='item'
       :itemIndex='index'
       >{{item.text}}
      </todo-item>
    </ul>
  </div>
</template>

<script lang='ts'>
// @ is an alias to /src
import { Vue, Component } from 'vue-property-decorator'
import TodoItem from '@/components/todoListItem-with-vuex.vue'
import { State, Mutation } from 'vuex-class';

@Component({
  name: 'todoList',
  components: {
    TodoItem
  }
})
export default class TodoList extends Vue {
  // store state
  @State public todoList!:any
  @Mutation public setTodoList!:any
  // data
  private inputValue: string = ''
  // methods
  private addTodoItem():void {
    if (!this.inputValue.trim().length){
      return
    }
    let item = {
      text: this.inputValue
    }
    this.setTodoList(item)
    this.inputValue = ''
  }
}
</script>
<style lang="scss">
.todo-list{
  width: 600px;
  margin: 0 auto;
  .nav{
    margin: 20px 0;
    input{
      width:515px;
      margin-right: 20px;
    }
  }
  .list{
    padding: 0;
    margin: 0;
    li{
      list-style: none;
    }
  }
}
</style>

