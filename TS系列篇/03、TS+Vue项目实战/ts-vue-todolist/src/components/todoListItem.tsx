import { Component, Vue, Prop, Emit } from 'vue-property-decorator';
import './todoListItem.scss'
interface ItemContent {
  text: string
}

@Component
export default class TodoItem extends Vue {
  @Prop({default: {} }) public item!: ItemContent
  @Prop() public itemIndex!: number

  // jsx
  protected render() {
    return (
    <li class='todo-item'>
      <p>{this.item.text}</p>
      <a-icon type="delete" nativeOn-click={this.onDelete}/>
    </li>
    )
  }
  // methods
  // 方式1
  // private deleteItem() {
  //   this.$emit('on-delete',this.itemIndex)
  // }
  // 方式二
  // @Emit('on-delete')
  // private deleteItem() {
  //   return this.itemIndex
  // }
  // 方式三
  @Emit()
  private onDelete() {
    return this.itemIndex
  }

}