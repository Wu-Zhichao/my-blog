# 1. 修改表格筛选图标
`ElementUI`中的表格组件的筛选功能，老实说做的有点粗糙了，首当其中的便是`icon`了，下面就说下如果替换`icon`。
```css
.xb-table {
  .el-icon-arrow-down::before {
    font-family: 'iconfont';
    // 使用你想要的替换图标字体
    content: '\e68f';
    font-size: 20px;
  }
}
```