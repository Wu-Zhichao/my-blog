在实际项目开发中，为了统一样式书写规范，通常是遵循`BEM`规范，结合`Less/Sass`使用，可以封装成函数：
- 封装
```css
$elementSeparator: "__";
$modifierSeparator: "--"; 
@mixin b($block) { 
    .#{$block} { 
        @content; 
    } 
} 
@mixin e($element) { 
    @at-root { 
        #{&}#{$elementSeparator + $element} { 
            @content; 
        } 
    } 
}
@mixin m($modifier) { 
     @at-root { 
        #{&}#{$modifierSeparator + $modifier} { 
             @content; 
        } 
    } 
}
```
- 使用
```html
<div class="el-button">
  <div class="el-button__btn">
    <button class="el-button__btn--primary">确定</button>
  </div>
</div>
```
```css
@include b(el-button) {
  display:'inline-block';
  @include e(btn) {
    height:30px
    @include m(primary) {
      color:#ee6666
    }
  }
}
```