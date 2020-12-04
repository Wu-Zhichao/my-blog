使用`Vue`开发已经几年的时间了，今天将10个日常工作中实践以及从其他国外文章看到的小技巧分享出来，希望能够让大家可以更愉快的撸码！


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

# 2. 监听生命周期`Hook`
## 2.1. 组件外部(父组件)监听(子)其他组件的生命周期函数
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

## 2.2. 监听组件内部的生命周期函数
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

# 3. 深度作用选择器
我们在写`Vue`组件的时候为了避免当前组件的样式对子组件产生影响，通常我们会在当前组件的`style`标签上加上`scoped`，这样在这个组件中写的样式只会作用于当前组件，不会对子组件产生影响。
```css
<style scoped>
.example {
    color: red;
}
</style>
```
这样转换后的结果：
```css
<style>
.example[data-v-f3f3eg9] {
    color: red;
}
</style>
```
但是有时候，我们引入的第三方组件，我们希望在当前组件中修改第三方组件的样式，对子组件也产生作用，同时跟第三方组件无关的样式继续`scoped`。
那么我们可以使用以下两种方式：
- 混用本地和全局样式
即：可以在一个组件中同时使用有 scoped 和非 scoped 样式。
```css
<style>
/* 全局样式 */
</style>

<style scoped>
/* 本地样式 */
</style>
```
- 使用操作符：`>>>`、`/deep/`、`::v-deep`
即：如果你希望`scoped` 样式中的一个选择器能够作用得“更深”，例如影响子组件，就可以使用操作符。
```css
<style scoped>
.a >>> .b { /* ... */ }
/*或*/
.a /deep/ .b { /* ... */ }
/*或*/
.a ::v-deep .b { /* ... */ }
/* .b选择器的样式不仅可以作用当前组件，也可以作用于子组件 */
</style>
```
编译后：
```css
.a[data-v-f3f3eg9] .b { /* ... */ }
```

# 4. 组件初始化时触发`Watcher`
默认情况下，`Watcher`在组件初始化的时候是不会运行的，所以如果在`watch`中监听的数据默认是不会进行初始化的。类似于这样：
```javascript
watch: {
    title: (newTitle, oldTitle) => {
        // 组件初始化时不会打印 
        console.log("Title changed from " + oldTitle + " to " + newTitle)
    }
}
```
但是，如果我们期望在初始化的时候运行`watch`，则可以通过添加`immediate`属性。
```javascript
watch: {
    title: {
        immediate: true,
        handler(newTitle, oldTitle) {
            // 组件初始化时会被打印
            console.log("Title changed from " + oldTitle + " to " + newTitle)
        }
    }
}
```

# 5. 自定义验证`Props`
我们都知道在子组件接收`props`时可以对传入的属性进行校验，可以校验为字符串、数字、数组、对象、函数。但我们也可以进行自定义校验。
示例：验证传入的字符串状态必须为`success`和`error`。
```javascript
props: {
  status: {
    type: String,
    required: true,
    validator: function (value) {
      return [
        'success',
        'error',
      ].indexOf(value) !== -1
    }
  }
}
```

# 6. 动态指令参数
`Vue`在绑定事件的时候支持将指令参数动态传递给组件，假设有一个按钮组件，并且在某些情况下想监听单击事件，而在其他情况下想监听双击事件。此时就可以使用动态指令参数。
```html
<template>
  ...
  <aButton @[someEvent]="handleSomeEvent()"/>
  ...
</template>

<script>
  ...
  data(){
    return{
      ...
      someEvent: someCondition ? "click" : "dblclick"
    }
  },

  methods:{
    handleSomeEvent(){
      // handle some event
    }
  }
  ...
</script>
```

# 7. 组件路由复用
在开发当中，有时候我们不同的路由复用同一个组件，默认情况下，我们切换组件，`Vue`出于性能考虑可能不会重复渲染。

但是我们可以通过给`router-view`绑定一个`key`属性来进行切换的时候路由重复渲染。
```html
<template>
    <router-view :key="$route.fullPath"></router-view>
</template>
```
# 8. 批量属性继承——使用`$props`将父组件的所有的`props`传递到子组件
在开发中当前组件从父组件接收传递下来的数据使用`props`接收，如果再将这些`props`数据传递到子组件，通常情况下，我们同样是使用属性绑定的方式一个一个的属性去绑定。但是如果`props`的数据很多，那么一个个的绑定方式就很不优雅。

此时我们可以使用`$props`来传递。

- Bad
```html
<template>
    <!-- 将从父组件接收到的props数据传递到子组件 -->
    <childComponent 
        :value1='value1'
        :value2='value2'
        :value3='value3'
        :value4='value4'
        :value5='value5'
    />
</template>
<script>
export default {
    // 从父组件接收到的props数据
    props: ['value1','value2','value3','value4','value5'],
    data() {
        return {....}
    .....
    }
}
</scrript>

// childComponent.vue
<script>
export default {
    props: ['value1','value2','value3','value4','value5'],
    data() {
        return {....}
    .....
    },
    mounted() {
        // 子组件可以接收到数据
        console.log(this.value1)
        console.log(this.value2)
        console.log(this.value3)
        console.log(this.value4)
        console.log(this.value5)
    }
}
</scrript>

```
- Good
```html
<template>
    <!-- 将从父组件接收到的props数据传递到子组件 
        使用v-bind="$props" 批量传递
    -->
    <childComponent 
        v-bind="$props"
    />
</template>
<script>
export default {
    // 从父组件接收到的props数据
    props: ['value1','value2','value3','value4','value5'],
    data() {
        return {....}
    .....
    }
}

// childComponent.vue
<script>
export default {
    props: ['value1','value2','value3','value4','value5'],
    data() {
        return {....}
    .....
    },
    mounted() {
        // 子组件可以接收到数据
        console.log(this.value1)
        console.log(this.value2)
        console.log(this.value3)
        console.log(this.value4)
        console.log(this.value5)
    }
}
</scrript>
```
属性继承在开发表单组件时，是不得不解决的问题，使用`$props`就可以很好的解决批量属性传递问题。

下面以开发一个`XInput`为例：
```html
<template>
    <label>姓名</label>
    <!-- 使用XInput组件 -->
    <XInput
        :value="value"
        :placeholder="placeholder"
        :maxlength="maxlength"
        :minlength="minlength"
        :name="name"
        :form="form"
        :value="value"
        :disabled="disabled"
        :readonly="readonly"
        :autofocus="autofocus"
        @input="handleInputChange"
    />
</template>
```
- Bad
```html
// XInput.vue
<template>
  <div>
    <input
      @input="$emit('input', $event.target.value)"
      :value="value"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :minlength="minlength"
      :name="name"
      :form="form"
      :value="value"
      :disabled="disabled"
      :readonly="readonly"
      :autofocus="autofocus">
  </div>
</template>
​
<script>
  export default {
    props: ['label', 'placeholder', 'maxlength', 'minlength', 'name', 'form', 'value', 'disabled', 'readonly', 'autofocus']
  }
</script>
```
- Good
```html
<template>
  <div>
    <input v-bind="$props">
  </div>
</template>
<script>
  export default {
    props: ['label', 'placeholder', 'maxlength', 'minlength', 'name', 'form', 'value', 'disabled', 'readonly', 'autofocus']
  }
</script>
```

# 9. 把所有父级组件的事件监听传递到子组件 - `$listeners`
如果子组件不在父组件的根目录下，则可以将所有事件侦听器从父组件传递到子组件。即在子组件可以获取到所有子组件的事件。
```html
// Parnet.vue
<template>
    <div>父组件</div>
    <!-- 组件 -->
    <Child
        @on-test1="handleTest"1
    />
</template>
// Child.vue
<template>
    <div>子组件</div>
    <!-- 组件 -->
    <!-- 使用v-on='$listeners'将所有父组件非原生事件传递到子组件 -->
    <sub-child
        @on-test2="handleTest2"
        @on-test3.native="handleTest3"
        v-on='$listeners'
    />
</template>
// SubChild.vue
<template>
    <div>孙子组件</div>
</template>
<script>
export default {
    ...
    mounted() {
        console.log(this.$listeners)
        /*
            {
                on-test1: ƒ invoker()
                on-test2: ƒ invoker()
            }
        */
        // 调要祖父组件的事件
        this.this.$listeners.on-test1()
        // 调要父组件的事件
        this.this.$listeners.on-test2()
    }
}
</script>
```
`注意`：如果使用`native`修改的事件则获取不到。即无法获取到原生事件。

# 10. 基础组件自动注册
在项目开发中我们通常对于通用组件都是用到的地方挨个`import`引入，这种方式虽然没有问题，但是作为一个有追求的程序狗怎么能做这种重复性的劳动呢。

你可以尝试下面这种基础组件自动全局注册的方式，通用组件只需要定义在`components/base/`文件夹下，就可以实现自动全局注册。需要使用的地方可以直接使用，无需单独引入。

```javascript
// utils/globals.js
/*
    这个方法负责基础组件的全局注册；
    这些组件可以在项目的任何地方使用而无需引入；
    所有的通用组件文件要定义在/components/base/文件夹下；
    组件命名采用：Base<componentName>.vue 的方式
*/
export const registerBaseComponents = vm => {
    // 引入通用组件
    const requireComponent = require.context(
        // 读取文件的路径
        './components/base',
        // 是否遍历文件的子目录
        false,
        // 匹配文件的正则
        /Base[\w-]+\.vue$\
    )
    requireComponent.keys().forEach(fileName => {
        // 获取每个组件文件配置
        const componentConfig = requireComponent(fileName)
        // 转换组件命名为驼峰命名
        const componentName = upperFirst(
            camelCase(fileName.replace(/^\.\//,'').replace(/\.\w+$/,''))
        )
        // 全局注册组件
        vm.component(componentName,componentConfig.default || componentConfig)
    })
}
```
然后，在入口文件`main.js`中引入并初始化。
```javascript
import Vue from 'vue'
import { registerBaseComponents } from '@/utils/globals'
registerBaseComponents(Vue)
.....
```
至此，我们的10个小技巧就分享完了，如果你觉得有用，请你动动小手点个赞让我知道[笔芯]

[参考文献1](https://dev.to/simonholdorf/10-tips-tricks-to-make-you-a-better-vuejs-developer-4n4d")

[参考文献2](https://www.telerik.com/blogs/12-tips-and-tricks-to-improve-your-vue-projects")