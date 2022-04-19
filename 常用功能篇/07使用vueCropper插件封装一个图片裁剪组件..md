# 1. 组件封装
```html
<template>
  <div class="image-cropper-container">
    <vueCropper
      ref="cropper"
      class="image-cropper"
      :class="[direction]"
      :img="originImg"
      :output-size="option.outputSize"
      :output-type="option.outputType"
      :can-scale="option.canScale"
      :auto-crop="option.autoCrop"
      :auto-crop-width="option.autoCropWidth"
      :auto-crop-height="option.autoCropHeight"
      :full="option.full"
      :fixed-box="option.fixedBox"
      :can-move="option.canMove"
      :can-move-box="option.canMoveBox"
      :original="option.original"
      :center-box="option.centerBox"
      :high="option.high"
      :info-true="option.infoTrue"
      :mode="option.mode"
    />
    <div class="bottom-panel">
      <div class="btn-rotate" @click="handeRotateCropper">
        <img
          class="btn-rotate__img"
          src="../../../../assets/my/icon-cropper-rotate@2x.png"
          alt=""
        />
      </div>
      <div class="standard-text">拍摄标准</div>
      <ul class="standard-content">
        <li
          class="standard-item"
          v-for="item in standardInfo"
          :key="item.imgSrc"
        >
          <img class="standard-item__img" :src="item.imgSrc" alt="" />
          <div class="standard-item__desc" :class="[item.status]">
            {{ item.title }}
          </div>
        </li>
      </ul>
      <div class="handle-btns">
        <div class="handle-btns__btn cancel" @click="handleCropperCancel">
          取消
        </div>
        <div class="handle-btns__btn confirm" @click="handleCropperDone">
          确认
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'
import img_standard_1 from '../../../../assets/my/img-photo-standard-1.png'
import img_standard_2 from '../../../../assets/my/img-photo-standard-2.png'
import img_standard_3 from '../../../../assets/my/img-photo-standard-3.png'
import img_standard_4 from '../../../../assets/my/img-photo-standard-4.png'
import img_standard_5 from '../../../../assets/my/img-photo-standard-5.png'
const standardInfo = [
  {
    title: '正确拍摄',
    imgSrc: img_standard_1,
    status: 'success'
  },
  {
    title: '四角缺失',
    imgSrc: img_standard_2,
    status: 'fail'
  },
  {
    title: '照片模糊',
    imgSrc: img_standard_3,
    status: 'fail'
  },
  {
    title: '闪光强烈',
    imgSrc: img_standard_4,
    status: 'fail'
  },
  {
    title: '留白太多',
    imgSrc: img_standard_5,
    status: 'fail'
  }
]
export default {
  name: 'ImageCropper',
  components: {
    VueCropper
  },
  props: {
    originImg: {
      type: String,
      required: true
    },
    fileName: {
      type: String,
      default: ''
    },
    direction: {
      // 身份证正反
      type: String,
      default: 'idCardBackPic'
    }
  },
  data() {
    return {
      option: {
        outputSize: 1, // 裁剪生成图片的质量
        outputType: 'png', // 生成图片的格式
        info: false, // 不显示裁剪框的大小信息
        canScale: true, // 允许滚轮缩放
        autoCrop: true, // 不生成截图框
        autoCropWidth: window.innerWidth - 60, // 生成截图框宽度
        autoCropHeight: (402 / 635) * window.innerWidth - 40, // 生成截图框高度 402 / 635 是素材框的高、宽，先计算比例再乘宽，得出高度
        full: false, // 不输出原图比例的截图
        fixedBox: true, // 截图框大小允许改变
        canMove: true, // 上传图片是否可以移动
        canMoveBox: false, // 截图框能否拖动
        original: false, // 上传图片按照原始比例渲染
        centerBox: false, // 截图框被限制在图片里面
        high: true, // 按照设备的dpr 输出等比例图片
        infoTrue: false, // 展示看到的截图框宽高
        mode: 'cover' // 图片默认渲染方式
      },
      standardInfo
    }
  },
  methods: {
    handleCropperDone() {
      // 获取base64数据
      const promise1 = new Promise(resolve => {
        this.$refs.cropper.getCropData(data => {
          resolve(data)
        })
      })
      // 获取文件对象
      const promise2 = new Promise(resolve => {
        this.$refs.cropper.getCropBlob(data => {
          const suffix = {
            jpeg: 'jpg',
            png: 'png',
            webp: 'webp'
          }[this.option.outputType]
          const file = new File([data], `${this.fileName}.${suffix}`, {
            type: `image/${this.option.outputType}`
          })
          resolve(file)
        })
      })
      Promise.all([promise1, promise2]).then(res => {
        this.$emit('on-success', { content: res[0], file: res[1] })
      })
    },
    handleCropperCancel() {
      this.$emit('update:originImg', '')
    },
    handeRotateCropper() {
      this.$refs.cropper.rotateLeft()
    }
  }
}
</script>

<style lang="less" rel="stylesheet/less">
.image-cropper-container {
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  .image-cropper {
    flex: 3;
    &.idCardFrontPic {
      .cropper-drag-box {
        background: url('../../../../assets/my/bg-cropper-front.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      }
    }
    &.idCardBackPic {
      .cropper-drag-box {
        background: url('../../../../assets/my/bg-cropper-back.png');
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      }
    }
    // 重置样式
    .cropper-crop-box {
      .cropper-view-box {
        // 去掉截图框线条
        outline: none;
        img {
          display: none;
        }
      }
      .cropper-move,
      .crop-info {
        opacity: 0;
      }
    }
  }
  .bottom-panel {
    flex: 1;
    box-sizing: border-box;
    padding: 20px 16px 25px 20px;
    .btn-rotate {
      position: absolute;
      left: 20px;
      top: 65%;
      font-size: 32rpx;
      color: #fff;
      display: flex;
      align-items: center;
      &__img {
        width: 40px;
        height: 40px;
        margin-right: 10px;
      }
    }
    .standard-text {
      font-size: 24px;
      margin-bottom: 14px;
    }
    .standard-content {
      display: flex;
      flex-wrap: nowrap;
      .standard-item {
        flex: 0 0 20%;
        &__img {
          width: 75%;
          height: 66px;
        }
        &__desc {
          font-size: 24px;
          display: block;
          &::after {
            content: '';
            display: inline-block;
            width: 25px;
            height: 25px;
            margin-left: 2px;
            vertical-align: middle;
          }
          &.success::after {
            background: url('../../../../assets/my/icon_right@2x.png');
            background-repeat: no-repeat;
            background-size: cover;
          }
          &.fail::after {
            background: url('../../../../assets/my/icon_error@2x.png');
            background-repeat: no-repeat;
            background-size: cover;
          }
        }
      }
    }
    .handle-btns {
      margin-top: 30px;
      display: flex;
      flex-wrap: nowrap;
      &__btn {
        flex: 1;
        height: 78px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
      }
      .confirm {
        background: #61da79;
        border-radius: 10px;
        font-size: 30px;
        font-weight: 400;
        color: #ffffff;
      }
      .cancel {
        background: #ffffff;
        border: 1.5px solid #47cc61;
        border-radius: 10px;
        font-size: 30px;
        font-weight: 400;
        color: #47cc61;
      }
    }
  }
}
</style>
```
# 2. 使用插件
```html
 <image-cropper
    :originImg.sync="currentCropperImgUrl"
    :file-name="originalFileNameInfo[currentHandleImgName]"
    :direction="currentHandleImgName"
    @on-success="handleCropperSuccess"
  />
...
data() {
  return {
    // 当前上传的方向
      currentHandleImgName: '',
      // 当前要裁剪的图片
      currentCropperImgUrl: '',
      // 真实的文件名
      originalFileNameInfo: {
        idCardFrontPic: '',
        idCardBackPic: ''
      },
  }
}
methods: {
  handleCropperSuccess(data) {
    this.idCardInfo[this.currentHandleImgName] = [data]
    this.currentCropperImgUrl = ''
  }
}
```