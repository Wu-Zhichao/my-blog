# 1. `.sync`修饰符实现`props`双向数据绑定
`Vue`的数据流向是单向数据流，即：父组件通过属性绑定将数据传给子组件，子组件通过`props`接收，但子组件中无法对`props`的数据修改来更新父组件的数据，只能通过`$emit`派发事件的方式，父组件接收到到事件后执行修改。Vue2.30以后新增了一个`sync`属性,可以实现子组件派发事件时执行修改父组件数据，无需再父组件接收事件进行更改。

示例：在父组件中控制子组件的显示隐藏
* 普通实现方式：
```html
// 父组件
<template>
    <div>
        <button @click="handleClick">click me</button>
        <child :visible="visible" @on-success="handleSuccess" @on-cancel='handleCancel'></child>
    </div>
</template>
<script>
export default {
    data() {
        return {
            visible: false
        }
    }
    methods: {
        handleClick() {
            this.visible = true
        },
        handleSuccess() {
            this.visible = false
        },
        handleCancel() {
            this.visible = false
        }
    }
}
</script>

// 子组件
<template>
    <div class="box" v-show="visible">
        <input type="text">
        <div>
            <button @click="cancel">取消</button>
            <button @click="submit">确定</button>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        submit() {
            this.$emit('on-success')
        },
        cancel() {
            this.$emit('on-cancel')
        }
    }
}
</script>
```
* .sync`修饰符实现方式
```html
// 父组件
<template>
    <div>
        <button @click="handleClick">click me</button>
        // 添加sync修饰符，相当于<child :visible="visible" @update:visible="visible=$event"></child>
        <child :visible.sync="visible"></child>
    </div>
</template>
<script>
export default {
    data() {
        return {
            visible: false
        }
    }
    methods: {
        handleClick() {
            this.visible = true
        }
    }
}
</script>

// 子组件
<template>
    <div class="box" v-show="visible">
        <input type="text">
        <div>
            <button @click="cancel">取消</button>
            <button @click="submit">确定</button>
        </div>
    </div>
</template>
<script>
export default {
    props: {
        visible: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        submit() {
            this.$emit('update:visible', false)
        },
        cancel() {
            this.$emit('update:visible', false)
        }
    }
}
</script>
```

# 2. 组件外部(父组件)监听(子)组件的生命周期函数
在有些业务场景下，在父组件中我们需要监听子组件，或者第三方组件的生命周期函数，然后来进行一些业务逻辑处理，但是组件内部有没有提供`change`事件时，此时我们可以使用`hook`来监听所有的生命周期函数。方式： @hook:钩子函数
```html
<template>
  <!--通过@hook:updated监听组件的updated生命钩子函数-->
  <!--组件的所有生命周期钩子都可以通过@hook:钩子函数名 来监听触发-->
  <custom-select @hook:updated="handleSelectUpdated" />
</template>
<script>
import CustomSelect from '../components/custom-select'
export default {
  components: {
    CustomSelect
  },
  methods: {
    handleSelectUpdated() {
      console.log('custom-select组件的updated钩子函数被触发')
    }
  }
}
</script>
```

# 3. 监听组件内部的生命周期函数
在组件内部，如果想要监听组件的生命周期钩子，可以使用`$on`,`$once`

示例：使用echart时，监听窗口改变事件，组件销毁时取消监听，通常是在`mounted`生命周期中设置监听，`beforeDestroy`钩子中销毁监听。这样就是要写在不同的地方，可以使用`this.$once('hook:beforeDestroy'),()=> {}`这种方式监听`beforeDestroy`钩子，在这个钩子处罚时销毁。
一次性监听使用`$once`,一直监听使用`$on`。
```javascript
export default {
  mounted() {
    this.chart = echarts.init(this.$el)
    // 监听窗口发生变化，resize组件
    window.addEventListener('resize', this.handleResizeChart)
    // 通过hook监听组件销毁钩子函数，并取消监听事件
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', this.handleResizeChart)
    })
  },
  methods: {
    handleResizeChart() {
      // do something
    }
  }
}
```
