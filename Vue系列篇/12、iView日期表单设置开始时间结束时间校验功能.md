前端在表单中校验结束时间晚于开始时间，开始时间早于结束时间是经常会遇到的需求，那么在使用`iview`的`DatePicker`组件是如何校验的呢？且看以下内容。
### 模板
```html
<template>
  <Form>
    <FormItem label="开始时间" prop="startTime">
      <DatePicker 
        v-model.trim="formDatas.startTime"
        type="date" 
        placeholder="请选择开始时间" 
        :options='startTimeOptions'
        @on-change="onStartTimeChange"
        clearable></DatePicker>
    </FormItem>
    <FormItem label="结束时间" prop="endTime">
      <DatePicker 
        v-model.trim="formDatas.endTime" 
        type="date" 
        placeholder="请选择结束时间" 
        :options='endTimeOptions'
        @on-change="onEndTimeChange"
        clearable></DatePicker>
    </FormItem>
  </Form>
</template>
```
### 逻辑
```javascript
<script>
  export default {
    data() {
      return {
        formDatas: {
          startTime: '',
          endTime: ''
        },
        startTimeOptions: {},
        endTimeOptions: {}
      }
    },
    methods: {
      onStartTimeChange(startTime,type) {
        this.endTimeOptions = {
          // 设置结束时间不能选的范围
          disabledDate(endTime) {
            return endTime < new Date(startTime)
          }
        }
        this.formDatas.startTime = startTime
      },
      onEndTimeChange(endTime,type) {
        this.startTimeOptions = {
          // 设置开始时间不能选的范围
          disabledDate(startTime) {
            return startTime > new Date(endTime)
          }
        }
        this.formDatas.endTime = endTime
      }
    }
  }
</script>
```