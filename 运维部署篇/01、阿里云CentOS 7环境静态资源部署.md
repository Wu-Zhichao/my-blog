> 作为前端er，服务部署虽然不是必备技能，但也不可避免的会有一些公司需要前端自己来部署前端代码，今天就简单的介绍下如果使用nginx进行静态资源部署和接口代理。
# 一、利用nginx搭建静态资源服务器
* nginx安装
```
 yum install nginx
```
* 启动nginx
```
 service nginx start
```
* 查看是否启动成功
```
 service nginx status
 // 如何active 显示running就表示已经启动成功 
```
此时，可以在终端通过`curl:http://服务器ip`或者在浏览器输入ip地址访问，默认`80`端口，如果成功会显示`welcome nginx`页面。

`注意`：如果通过ip无法访问，可通过以下两种方式排查：

  1)、是否关闭防火墙
  >`CentOS`防火墙默认是`firewalld`,关闭防火墙可通过以下命令：
  ```
   systemctl stop firewalld
  ```
  2)、`80`端口是否开放
  > 阿里云CentOS系统默认80端口是不开放的，因此需要登录阿里云官方进行配置，具体配置如下：

  配置路径：登录阿里云-控制台-云服务器ECS-实例-更多-网络和安全组-安全组配置-配置规则-添加安全组规则

  `ps`: 规则方向选`入方向`，端口范围写`80/80`，授权对象写`	
0.0.0.0/0`
 
# 二、静态资源文件上传到服务器

## 1、安装文件上传插件`lrzsz`
> 阿里云默认安装了`lrzsz`插件，可以直接使用`rz`命令上传文件，如果没有,可以使用以下命令安装：
```
yum install lrzsz
```
## 2、创建静态资源上传文件夹
> 在服务器根目录的`home`目录下创建静态资源上传文件夹`html`
 ```
  // 切换到home目录
  cd /home
  // 创建html文件夹
  mkdir html
 ```
## 3、将静态资源文件上传到服务器指定目录
 * 上传文件
    > cd切换到`html`目录下，执行`rz`命令会弹出文件选择框，选择你要上传的静态资源(压缩包),确定后开始上传。
 * 解压资源
    > 上传静态资源包到服务器后需要进行解压
    ```
     unzip test.zip
    ```

# 三、 nginx配置
* 查看nginx安装位置
```
  whereis nginx
```
* 进入nginx配置文件目录
```
  cd /etc/nginx/  找到nginx.conf文件
```
* 打开配置文件
```
 vim nginx.conf
```
* 代理配置
```
server {
    // 访问端口号
    listen       80;
    // 服务器地址(访问ip)
    server_name  116.62.238.176;
  
    include /etc/nginx/default.d/*.conf;
    // 静态资源文件
    location / { 
      // 静态资源存放路径
      root /home/html/; 
      // 默认读取文件
      index index.html index.htm;     
    }
    // 接口代理
    location /api {
      // 后端代码接口地址
      proxy_pass: http://120.78.xx.xx:8071;
    }

    error_page 404 /404.html;
        location = /40x.html {
    } 
```
* 重启nginx
```
 nginx -s reload
```
至此，通过服务器ip在浏览器访问就可以看到部署的静态资源了。


