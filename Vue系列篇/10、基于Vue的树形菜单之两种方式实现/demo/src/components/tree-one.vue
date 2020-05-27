<template>
  <ul>
    <li v-for="(item, index) in treeData" :key="index" :class="{'active':!(item.children && item.children.length > 0)}">
      <span class='item'>
        <span class="icon" @click="item.isExpand = !item.isExpand">
          <img v-if="item.children && item.children.length > 0 && !item.isExpand" src="../assets/img/icon_arrow_right.png">
          <img v-else-if="item.children && item.children.length > 0 && item.isExpand" src="../assets/img/icon_arrow_down.png">
        </span>
        <span class="title"
          @click="handleClick(item)">{{item.meta.text}}</span>
      </span>
      <!-- 递归组件 -->
      <tree-one v-show="item.isExpand" v-if="item.children && item.children.length > 0" :treeData="item.children"></tree-one>
    </li>
  </ul>
</template>
<script>
export default {
  name: 'TreeOne',
  props: {
    treeData: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  methods: {
    handleClick(){}
  }

}
</script>
<style>
li{
  line-height: 30px;
  cursor: pointer;
}
.active{
  padding-left: 16px;
}
</style>


