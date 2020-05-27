# 一、情景摘要
在项目开发中，我们经常会遇到需要上传附件的需求，如果实际业务场景下只需要上传少量附件的，上传到代码部署的同一台服务器是没问题的，但是如果上传附件的场景非常多，那么同一台服务器可能就承受不住了，这时就需要一台专门的文件服务器。我们常用的是阿里云的对象存储OSS。根据阿里云的OSS官方文档介绍，有多种方式的直传方式，本文选取了安全和性能就都比较高的服务端签名直传并设置上传回调的方式，重点讲述前端实现。
# 二、操作流程

## 1、前端根据后端提供的接口向后端发送请求，获取文件上传需要的签名、Policy和回调等信息。
```javascript
// 请求api封装
const baseApi = process.env.NODE_ENV === 'production' ? '/' : '/upload'
import $axios from '@/libs/request'
// 请求方法
export const getSignature = () => {
  // $axios.request()为封装过的专门发送请求的方法
  return $axios.request({
    url: `${baseApi}/upload/token`,
    method: 'GET'
  })
}
```
## 2、根据请求获取到的签名策略信息生成oss上传需要的表单参数。
```javascript
import {getSignature} from '@/api/api-upload'

let accessid = ''
let policyBase64 = ''
let signature = ''
let callbackbody = ''
let key = ''
let expire = 0
let host = ''
let g_object_name = ''
let now =  Date.parse(new Date()) / 1000;

// 生成随机字符串
function random_string(len) {
  len = len || 32;
  var chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  var maxPos = chars.length;
  var pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
}
// 获取用户上传原始文件名
function get_file_name(filename) {
  let pos = filename.lastIndexOf('.')
  let suffix = ''
  if (pos != -1) {
    suffix = filename.substring(pos)
  }
  return suffix;
}
//  把随机生成的字符串拼接在原始上传文件名后面生成新的唯一文件名
function set_file_name(filename) {
  let suffix = get_file_name(filename)
  g_object_name = key + random_string(10) + suffix
  return ''
}

// 获取后端返回的签名信息，生成oss参数
function oss(filename = null) {
  // 可以判断当前expire是否超过了当前时间， 如果超过了当前时间， 就重新取一下， 3 s 作为缓冲。
  now = Date.parse(new Date()) / 1000;
  if (expire < now + 3) {
    // 调用后端服务器接口获取签名信息，利用axios返回promise，可以链式调用
      return getSignature().then(res => {
        console.log(res)
        /* 返回的签名策略信息包含:
        {
          accessid: "LTAI*******UPPr", // 用户请求的accessid
          callback: "eyJjYWxs************H0ifQ==", // 回调
          dir: "test/file-dir/", // 上传文件的存储位置
          expire: "1557974779", // 上传策略Policy失效时间
          host: "http://xxxxxxxxx.com", // 上传文件服务器地址
          policy: "eyJleHBp***********6/EMG7U=" ,// 用户表单上传的策略（Policy)
          signature: "JumJy*****k6/EMG7U=" // 签名信息
        }
        */
        policyBase64 = res['policy']
        accessid = res['accessid']
        signature = res['signature']
        expire = parseInt(res['expire'])
        callbackbody = res['callback']
        host = res['host']
        key = res['dir']

        if (filename != null) {
          set_file_name(filename)
        }
        // 返回表单上传需要的参数信息
        return {
          'host': host,
          'key': g_object_name,
          'policy': policyBase64,
          'OSSAccessKeyId': accessid,
          'success_action_status': '200', //让服务端返回200,不然，默认会返回204
          'callback': callbackbody,
          'signature': signature,
        };
      })
  }
}

export { oss }
```

## 3、配合iView的Upload组件实现上传
生成上传的表单参数后，使用任何文件上传的组件都可以，只需要在提交文件上传的时候带上生成的参数即可。这里我们在vue项目中使用iView的Upload组件进行上传。
```html
<Upload
  multiple
  type="drag"
  :action="uploadHost" // 上传地址
  :data='uploadData' // 上传携带的参数
  :before-upload='beforeUpload' // 上传的钩子
  :on-success="handleSuccess" // 上传成功后回调
  >
  <div style="padding: 20px 0" class="handle_upload">
    <img src="../../../assets/img/business/upload.png">
    <span class="des">点击将文件拖拽或点击上传</span>
  </div>
</Upload>
```
```javascript
// 引入生成上传参数方法
import {oss} from '@/libs/uploadFile'
export default{
  data() {
  // 附件上传路径
    uploadHost: '',
    // 附件上传携带参数
    uploadData: {},
    // 上传的文件名
    fileName: '',
    // 文件上传后的地址
    filePath: ''
  },
  methods: {
    // 在Upload组件的钩子before-upload中获取到生成的参数信息
    beforeUpload(file) {
      return oss(file.name).then(res => {
        this.uploadHost = res.host
        this.uploadData = res
      })
    },
    // 上传成功的回调函数
    handleSuccess(res, file, fileList) {
      console.log(res.data)
      /* 上传成功后，文件服务器会返回上传文件在oss上存储位置、文件名及相关信息
      {
        filename: "test/file-dir/JdzYDhdrtF.jpg"
        height: "683"
        mimeType: "image/jpeg"
        size: "186142"
        url: "http://xxxx.xxx.com/test/file-dir/JdzYDhdrtF.jpg"
        width: "1024"
      }
     *
    */

    // 根据自己的业务场景，将返回的文件位置信息和其他表单信息一起提交给后端进行业务关联，在其他地方需要使用附件时可以根据url位置找到上传的文件 
      this.fileName: res.data.filename,
      this.filePath: res.data.url
    }
  }
}
```
至此，一个完整功能的文件上传到阿里云的OSS已经完成。
