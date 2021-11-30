项目开发其实就好比盖房子，好的地基才能保证房子的长住久安，项目开发也一样，好的基础架构对项目开发也是非常重要，这决定了你的项目的可扩展性和可维护性。在我们日常开发过程中，良好完善的开发工作流是项目架构的一部分，对开发体验和代码规范都至关重要。那么今天就聊一下基于`VueCli` + `ESlint` + `Prettier` + `Lint-Stage` +  `Commitlint` + `VSCode`搭建一个前端工作流，让你可以愉悦的进行项目开发。
# 1. VueCli
`VueCli`其实不必多说，熟悉`Vue`的同学都知道，它可以用来快速的搭建一个基于`Vue`的前端项目开发环境，帮我们完成了很多环境配置，使我们可以开箱即用的进行业务开发。这里主要需要说一下的是，我们在选择代码格式化工具的时候选择`ESLint`+ `Prettier`的组合。
<img src="./img/eslint.png" />

# 2. ESLint
`ESLint`主要是用来进行代码质量检查和代码风格检查的格式化工具，它主要是用来进行代码质量检查的，比如：变量定义未使用，同时也可以进行代码风格检查，比如双引号，或者末尾分号等。`ESLint`只对js文件有效。

在`VueCli`生成的项目中如果选择了`ESLint`+ `Prettier`作为`lint`规范，那么有一套默认的规范会进行代码风格检查，但是如果默认的规范不符合你的开发习惯，也可以进行自定义自己的规则，可以在项目`peckage.json`文件`eslintConfig`属性中进行配置，或者在项目根目录创建`.eslintrc.js`文件进行`eslint`规则配置。
```js
// .eslintrc.js
module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  extends: [
    "plugin:vue/essential",
    "eslint:recommended",
    // 在风格校验时，使用 prettier 来替代 eslint 的格式化功能,启用 Prettier 的规则，依赖eslint-plugin-prettier插件。ps:不规范的地方只提示warning
    "@vue/prettier" 
      // 'plugin:prettier/recommended' // 在风格校验时，使用eslint中prettier扩展作为格式化规范。ps：不规范的地方提示error
  ],
  parserOptions: {
    parser: "babel-eslint"
  },
  rules: {
    // 生产环境不允许console打印
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 生产环境不允许debugger
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 在具名函数/和匿名函数名(function)后面不要留空格 var anonymousWithoutSpace = function() {};
    'space-before-function-paren': ['warn', { anonymous: 'never', named: 'never', asyncArrow: 'always' }], 
    // 数组两个[ ]之间需要一致的换行符
    'array-bracket-newline': ['error', 'consistent'], 
    // 数组元素之间保持一致的换行符
    'array-element-newline': ['error', 'consistent'], 
    // 数组/对象末位元素不加逗号
    'comma-dangle': ['error', 'never'], 
    // 如果三元表达式自身跨越多个行，则在三元表达式的操作数(: / ? / && )之间强制换行。
    'multiline-ternary': ['error', 'always-multiline'], 
     // 允许对象属性不换行，默认是强制换行
    'object-property-newline': ['error', { allowAllPropertiesOnSameLine: true }],
    // if 内有 return 不允许结束后再跟 else
    'no-else-return': 'error', 
     // 除了null,其他用===而不是==
     'eqeqeq': ['error', 'always', { null: 'ignore' }],
     // 两个空格缩进
     'indent': [2, 2, { SwitchCase: 1 }],
     // 已定义未使用的变量
     'no-unused-vars': [2, { vars: 'all', args: 'after-used'}],
      // 多行 if 语句的的括号不能省
    'curly': [2, 'multi-line'],
     // else必须和反花括号一行
    'brace-style': [2, '1tbs', { allowSingleLine: true }],
     // 使用浏览器全局变量时加上 window. 前缀
     'no-undef': 2,
     // 不允许有连续多行空行
    'no-multiple-empty-lines': [2, { max: 1 }],
    // 换行符在运算符的位置
    'operator-linebreak': [2, 'after', { overrides: { '?': 'before',':': 'before'}}],
    // 条件语句中赋值语句
    'no-cond-assign': 2,
    // 单行代码块两边加空格
    'block-spacing': [2, 'always'],
    // 对属性名强制使用驼峰
    'camelcase': [ 0, { properties: 'always'}],
    // 不允许有多余的行末逗号
    'comma-dangle': [2, 'never'],
    // 始终将逗号置于行末
    'comma-style': [2, 'last'],
    // 点号操作符须与属性需在同一行
    'dot-location': [2, 'property'],
    // 函数调用时标识符与括号间不留间隔
    'func-call-spacing': ['error', 'never'],
    // 键值对当中冒号与值之间要留空白
    'key-spacing': [ 2, { beforeColon: false, afterColon: true }],
    // 构造函数要以大写字母开头, 但调用大写字母开头的函数不一定需要new
    'new-cap': [ 2, { newIsCap: true, capIsNew: false }],
    // 无参的构造函数调用时要带上括号
    'new-parens': 2,
    // 对象中定义了存值器，一定要对应的定义取值器
    'accessor-pairs': 2,
    // 子类的构造器中一定要调用 super
    'constructor-super': 2,
    // 使用数组字面量而不是构造器
    'no-array-constructor': 'error',
    // 避免使用 arguments.callee 和 arguments.caller
    'no-caller': 2,
    // 避免对类名重新赋值
    'no-class-assign': 2,
    // 避免修改使用 const 声明的变量
    'no-const-assign': 2,
    // 正则中不要使用控制符
    'no-control-regex': 'error',
    // 不要对变量使用 delete 操作。
    'no-delete-var': 2,
    // 不要定义冗余的函数参数
    'no-dupe-args': 2,
    // 类中不要定义冗余的属性
    'no-dupe-class-members': 2,
    // 对象字面量中不要定义重复的属性
    'no-dupe-keys': 2,
    // switch 语句中不要定义重复的 case 分支
    'no-duplicate-case': 2,
    // 同一模块有多个导入时一次性写完
    'no-duplicate-imports': 'error',
    // 正则中不要使用空字符
    'no-empty-character-class': 2,
    // 不要解构空值
    'no-empty-pattern': 2,
    "space-before-function-paren": 0
  }
}
```

# 3. Prettier 
`Prettier`主要是用来进行代码风格检查的，比如：双引号，末尾分号等，在`VueCli`生成的项目中如果选择了`ESLint`+ `Prettier`作为`lint`规范，默认会有一套代码风格检查规范。同样也支持自定义，在项目的根目录创建`.prettierrc.js`文件进行配置，`Prettier`官方其实只有二十多项配置，你可以根据自己的喜好进行配置。

我一般遵循的原则就是：代码质量相关的在`eslint`中配置，代码风格规范相关的在`prettier`中配置，当`prettier`配置的规则和`eslint`中相关的规则冲突时，再在`eslint`中把相关规则配置成一样。
```js
module.exports = {
  printWidth: 80, // 推荐最大行长度 - 80个字符
  tabWidth: 2, // 指定缩进空格数
  useTabs: false, // 用tab而不是空格缩进行，如果设置为true，tabWidth: 2 就会和eslint的ndent": ["error", 2]冲突
  semi: false,   // 末尾分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象的属性添加引号
  jsxSingleQuote: true, // 在jsx中使用单引号
  trailingComma: 'none', // 末尾逗号
  bracketSpacing: true, // 对象花括号中间添加空格
  bracketSameLine: false, // 把HTML末尾 > 标签单独一行，
  arrowParens: 'avoid', // 箭头函数参数只有一个时不用括号，x => x
  insertPragma: false, // 在文件顶部插入一个特殊的 @format 标记，指定文件格式需要被格式化。
  htmlWhitespaceSensitivity: 'ignore', // 忽略标签周围的空白
  vueIndentScriptAndStyle: false, //  不在 Vue 文件中缩进脚本和样式标签
  endOfLine: 'auto', // 行尾换行格式
}
```
# 4. VSCode
经过以上的配置，我们项目已经具备了代码规范检查的能力了，也就是说如果你写的代码不符合规范，是会进行错误或者警告提示，但是需要你手动修复，或者执行`npm run lint`命令进行全局自动修复(只能修复代码风格相关规则)。显然，这是不符合我们的开发习惯的，那么，此时我们可以结合编辑器开发工具`VSCode`，按`Ctrl`+`S`进行保存的时候可以自动修复代码格式错误或警告，这样就可以进行高效的开发了。
- `VSCode`安装`ESLint`和`Prettier`插件
- 在编辑器配置文件`setting.json`中配置 
```js
"editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true
  },
"files.autoSave": "onFocusChange"
```

# 5. husky & lint-Stage
至此，项目的开发规范项目的已经配置完成了。但是在实际开发中，通常是多个人进行合作的，我们不能保证每个人提交的代码都是经过`lint`修复后的，那么就需要在加一层保障。即：在提交代码时自动进行`lint`检查，可以自动修复的自动修复，无法修复的就会提交失败，手动处理完成后，再次检查通过后才可以提交。

那么我们就使用到了`husky`和`lint-Stage`工具了，`husky`可以监测到代码提交的生命周期，在进行代码`commit`的时候触发`lint-Stage`执行相关命令自动进行`lint`。
- 安装`husky`和`lint-Stage`
- 在`package.json`进行如下配置
```js
 "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
    }
  },
  "lint-staged": {
    "*.{js,vue}": [
      "npm run lint",
      "git add ."
    ]
  }
```
`注意`：`husky`最新版本的可能不起作用，目前我使用的是`4.3.8`版本的。

# 6. Commitlint 
`commit message`是我们开发每天都要做的事情，但五花八门的提交记录让我们在查看记录时也很崩溃，因此也需要进行一定的规范。也就是提交的`commit message`加上前缀标识进行分类，提交代码时需要加上前缀才可以提交，否则会提交失败。
- 具体规范：
  - feat：新功能（feature）
  - fix：修补 bug
  - docs：文档（documentation）
  - style：格式（不影响代码运行的变动）
  - refactor：重构（即不是新增功能，也不是修改 bug 的代码变动）
  - test：增加测试
  - chore：构建过程或辅助工具的变动

- 相关配置
  - 安装`@commitlint/cli`、`@commitlint/config-conventional`
  - 在根目录下新建`commitlint.config.js`文件，并配置:
  ```js
  module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'revert']
      ],
      'subject-full-stop': [0, 'never'],
      'subject-case': [0, 'never']
    }
  }
  ```

  - 在`package.json`中配置:
  ```js
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "commit-msg": "commitlint -e $GIT_PARAMS"
    }
  },
  "lint-staged": {
    "*.{js,vue}": [
      "npm run lint",
      "git add ."
    ]
  },
  "config": {
    "commitizen": {
      "path": "cz-customizable"
    }
  },
  ```
至此，一个规范的前端工作流就搭建完成了，可以愉快的撸代码了，同时组长再也不用担心代码不规范了~~~