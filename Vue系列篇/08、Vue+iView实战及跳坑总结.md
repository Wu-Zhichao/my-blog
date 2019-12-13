# 1、`iView`的`Tooltip`设置显示位置偏移量
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

# 2、`iView`中`DatePicker`必填校验问题
* 问题
> `DatePicker`的表单项作为必填字段进行校验时，在修改赋值的时候，无法通过必填校验
* 解决
```javascript
<template>
  <div>
    <Form
      ref="formValidate"
      :model="contractFormDatas"
      :rules="ruleValidate"
      label-position="top"
      inline>
      <FormItem label="签署日期" prop="signTime">
        <DatePicker 
          v-model.trim="contractFormDatas.signTime" 
          type="date"
          placeholder="请选择签署日期"
          clearable
          @on-change='contractFormDatas.signTime=$event'></DatePicker>
      </FormItem>
    </Form> 
  </div>
</template>
<script >
  export default {
    data() {
      return {
        contractFormDatas: {
          signTime: ''
        },
        ruleValidate: {
          // 设置pattern: /.+/时，修改赋值的时候，可通过校验
          signTime: [
            { required: true, message: "请选择签署日期", trigger: "change",pattern: /.+/}
          ]
        }
      }
    }
  }
</script >
```
  
# 3、在vue模板中遍历拼接动态唯一属性
* 方式一：使用字符串拼接
```html
<div v-for="(item,index) in list" :key='index'>
  <div :id="'id_' + index ">测试</div>
</div>
```
* 方式二：使用`filters`过滤器
```html
<div v-for="(item,index) in list" :key='index'>
  <div :id="index | format">测试</div>
</div>
// ...
filters: {
  test(index) {
    return 'id_' + index
  }
}
```
* 方式三：使用`methods`
```html
<div v-for="(item,index) in list" :key='index'>
  <div :id="test(index)">测试</div>
</div>
  // ....
methods: {
  test(index) {
    return 'id_' + index
  }
}
```

# 4、`watch`监听对象属性
在`vue`中可以使用`watch`监听`data`中的属性，如果需要监听对象的属性，可以使用如下方式：

```javascript
  data() {
    return {
      formData: {
        phone: ''
      }
    }
  },
  watch: {
    'formData.phone':function(val,oldValue) {
      // ....
    }
  }
```

# 5、格式化`iView`的`DatePicker`组件返回数据
在表单中使用`DatePicker`返回数据时国际标准时间的格式，即:`"2019-12-11T16:00:00.000Z"`,但在提交表单的时候需要正常的格式，可以在`on-change`时间中做如下处理：
* 方式一
```html
<FormItem label="签署日期" prop="signTime">
  <DatePicker 
    v-model.trim="contractFormDatas.signTime" 
    type="date"
    placeholder="请选择签署日期"
    clearable
    @on-change='contractFormDatas.signTime=$event'></DatePicker>
</FormItem>
// 返回结果："2019/11/11 00:00"
```
* 方式二：
```html
<FormItem label="签署日期" prop="signTime">
  <DatePicker 
    v-model.trim="contractFormDatas.signTime" 
    type="date"
    placeholder="请选择签署日期"
    clearable
    @on-change='handleChange'></DatePicker>
</FormItem>
// ....
methods: {
  handleChange(time,type) {
    this.contractFormDatas.signTime = time
  }
}
```

# 6、解析树结构数据，拼接成`Tree`组件所需格式
```javascript
export const getTree = (tree = []) => {
  let arr = []
  if (!!tree && tree.length !== 0) {
    tree.forEach(item => {
      let obj = {}
      obj.title = item.departName
      obj.expand = true
      obj.departmentId = item.nodeId
      obj.children = getTree(item.children)
      arr.push(obj)
    })
  }
  return arr
}
```