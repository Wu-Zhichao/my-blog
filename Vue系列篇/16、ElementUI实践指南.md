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
# 2. 表格添加loading效果
`el-table`的`v-loading`属性可以指定显示隐藏`loading`效果,同时添加下列属性可以在加载的时候进行效果控制：
`element-loading-background`: 属性可以定义加载动画的背景，
`element-loading-text`:属性指定加载提示文字
`element-loading-spinner`:属性指定加载动画效果
```html
<el-table
   v-loading = "isLoading"
   element-loading-background = "rgba(255, 255, 255, .5)"
   element-loading-text = "加载中，请稍后..."
   element-loading-spinner = "el-icon-loading">
</el-table>
```

# 3. 表格设置默认勾选项
`Table`组件设置对应行默认勾选上，就调用组件的内部方法`toggleRowSelection`，把对应项的数据传进入就可以了。
```js
async getTableData() {
    const {data: { records } } = await queryBillData()
    this.billTableData = records.map(item => {
      // 根据自己的业务条件判断
      if (item.negativeFlag) {
        // 默认勾选对应项
        this.$refs.billTable.toggleRowSelection(item, true)
      }
      return item
    })
  }
```
# 4. 表格设置禁选项
`Table`组件设置对应行禁止勾选，可对 `type=selection` 列设置`selectable`属性的函数返回值来控制，返回值为`false`，则该行禁止勾选。
```js
<template>
  <el-table
    ref="costomTable"
    :data="tableData"
    style="width: 100%">
    <el-table-column
      type="selection"
      width="55"
      :selectable="initSelectable"
      >
    </el-table-column>
    <el-table-column
      prop="name"
      label="姓名"
      width="120">
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  data() {
    return {
      tableData: []
    }
  },
  methods: {
    initSelectable(row) {
      // 返回值为false 禁止勾选
      return row.falg
    }
  }
}
</script>
```
# 5. 表格设置跨分页勾选数据
在实际工作中经常会有需求，在第一页勾选几条数据，翻到第二页勾选，然后再返回第一页查看，希望第一页勾选的数据依旧是勾选状态。在`Table`组件中可以通过设置`type=selection`列的`reserve-selection`属性为`true`和`table`指定`row-key`属性来控制，注意：`row-key`属性接收一个函数，函数返回值必须是列表数据中唯一的字段(一般使用id)。
```js
<template>
  <el-table
    ref="costomTable"
    :data="tableData"
    style="width: 100%"
    :row-key="row => row.id"
  >
    <el-table-column
      type="selection"
      width="55"
      :reserve-selection="true"
      >
    </el-table-column>
    <el-table-column
      prop="name"
      label="姓名"
      width="120">
    </el-table-column>
  </el-table>
</template>
<script>
export default {
  data() {
    return {
      tableData: []
    }
  }
}
```
# 6. 表单禁止输入空格
- 方式1：使用`trim`去除输入框前后空格，中间空格会保留
```html
<el-input
  type="text"
  v-model.trim="formData.name"
  placeholder="输入姓名"
/>
```
- 方式2：使用正则替换
```html
<el-input
  type="text"
  v-model="formData.name"
  placeholder="输入姓名"
  @input="formData.name = formData.name.replace(/\s+/g,'')"
/>
```
- 方式3：使用原生键盘事件禁止输入空格
```js
/* 示例为Element UI 的可下拉和输入筛选，同时支持输入新增组件*/
<el-select
  v-model="form.invoiceType"
  placeholder="请选择开票类型"
  clearable
  filterable
  allow-create
  @keydown.native="handleOnKeyDown($event)"
  >
  <el-option v-for="item in invoiceTypeOptions" :label="item" :value="item" clearable :key="item" />
</el-select>
...
handleOnKeyDown(e) {
  // 禁止输入空格
  if(e.keyCode == 32){
    e.returnValue = false
  }
}
```
# 7. 日期组件设置禁选时间
日期组件可以通过设置`picker-options`属性来控制禁选时间。
```js
 <el-date-picker
    v-model="form.belongDatePeriod"
    type="daterange"
    align="left"
    range-separator="-"
    start-placeholder="开始日期"
    end-placeholder="结束日期"
    value-format="yyyy-MM-dd"
    :clearable="false"
    :editable="false"
    :picker-options="pickerOptions"
  >
  </el-date-picker>
  ......
  data() {
    return {
      pickerOptions: {
        disabledDate(time) {
          return setDatePickerDisableAfterDate(
            time,
            `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`
          )
        }
      },
    }
  },
  methods: {
    setDatePickerDisableAfterDate (time, pickerTime)  {
      // 获取指定时间点的年月日
      const date = new Date(pickerTime)
      const year = date.getFullYear() // 年
      let month = date.getMonth() + 1 // 月
      let day = date.getDate() // 日
      // 如果是1-9月需要在前面补0
      if (month >= 1 && month <= 9) {
        month = '0' + month
      }
      if (day >= 1 && day <= 9) {
        day = '0' + day
      }
      // 获取到的指定时间的年月日就是：
      const pointDate = year.toString() + month.toString() + day.toString()

      // 获取时间选择器的年月日
      const pickerYear = time.getFullYear()
      let pickerMonth = time.getMonth() + 1
      let pickerDay = time.getDate()
      if (pickerMonth >= 1 && pickerMonth <= 9) {
        pickerMonth = '0' + pickerMonth
      }
      if (pickerDay >= 1 && pickerDay <= 9) {
        pickerDay = '0' + pickerDay
      }
      const pickerDate = pickerYear.toString() + pickerMonth.toString() + pickerDay.toString()
      // 为true的时间就不能选
      return pickerDate >= pointDate
    }
  }
```
# 8. 输入框禁止自动填充账号密码
在`el-input`中，浏览器会自动将已保存的账号密码填充到`type`为`password`的输入框中，当不需要时可以设置`autocomplete="new-password`
```js
<el-input
    v-model="formData.password"
    show-password
    placeholder="请输入密码"
    style="width: 240px"
    clearable
    autocomplete="new-password"
  ></el-input>
```

# 9. 表单校验参入业务逻辑
```js
formRules: {
  amount: [
    {
      required: true,
      message: '请输入金额',
      trigger: 'blur'
    },
    {
      validator(rule, value, cb) {
        if (Number(value) === 0) {
          cb(new Error(`输入金额不能为0`))
        } else {
          cb()
        }
      }
    },
    {
      validator: (rule, value, cb) => {
        Number(value) > Number(this.formData.balance) ? cb('输入金额不能大于可用余额') : cb()
      }
    }
  ]
}
```