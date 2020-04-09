<template>
  <div class="list-item">
    <li class="todo-item">
      <p class="text">{{item.text}}</p>
      <a-icon type="delete" @click.native="deleteItem"/>
    </li>
  </div>
</template>
<script lang='ts'>
import { Component, Vue, Prop } from 'vue-property-decorator';
import {Mutation} from 'vuex-class'
interface ItemContent {
  text: string
}
@Component({
  name: 'TodoListItem'
})
export default class TodoListItem extends Vue {
  @Prop({default: {} }) public item!: ItemContent
  @Prop() public itemIndex!: number
  @Mutation public updateTodoList!: any
  // method
  private deleteItem() {
    this.updateTodoList(this.itemIndex)
  }
}
</script>
<style lang='scss'>
  .todo-item{
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 30px;
    background-color: #ddd;
    padding: 0 10px;
    margin-bottom: 5px;
    p{
      margin: 0;
    }
    i {
      font-size: 20px;
      cursor: pointer;
    }
  }
</style>