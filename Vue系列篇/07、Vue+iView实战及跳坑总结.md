# 1、`iView`的`Tooltip`组件显示位置偏移量的设置
在官方文档中，`Tooltip`显示文本可以自由的设置显示方向，但是偏移量设置官方`API`只给出了一个`offset`属性，默认值为`0`，类型为`number`。并无具体示例。经过测试，`offset`可以接受两个值，具体如下：
* offset 属性：
  - 一个值：表示水平偏移。正值向右偏移，负值向左偏移
  - 两个值：第一个值表示水平偏移，第二个表示垂直偏移。正值向右向上，负值向左向下
```html
// 表示向左偏移20px，向上偏移20px
<Tooltip placement="top" offset='-20, 20' content='我是显示文字'>
  <img :src="item.menuIcon">
</Tooltip>
```
