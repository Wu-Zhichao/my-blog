本系列上一篇主要讲了利用Nginx进行简单的静态资源部署，这种方式需要在代码更新以后手动的把代码重新上传到服务器进行部署，方式比较原始。在现代的敏捷式的软件开发和管理中，产品需要快速的进行更新和迭代，传统的迭代和交付方式已无法满足现实的需要。因此，一种新的交付和部署方式就产生了，简称为CI、CD。

# 一、 CI/CD、Jenkins的基本认识

# 二、创建待部署的项目并推送至远程仓库
## （一）、使用Vue-Cli创建一个待部署的Vue项目
* 全局安装vue/@cli
```bash
  npm install -g vue@cli
```
* 使用vue/@cli创建项目
```bash
  vue create jenkins-demo
```
* 运行项目
```bash
  cd jenkins-demo
  npm run serve
```
此时，在浏览器url输入localhost:8080就可以访问到刚才创建的初始化项目了。

## （二）、创建一个远程仓库并将项目代码推送至远程仓库
* 在码云/github/gitlab上创建一个项目
* 在本地项目文件夹下执行如下命令，将本地仓库和远程仓库进行关联
```bash
  git remote add origin https://gitee.com/Ron_wu/jenkins-demo.git
```
* 将本地仓库代码推送到远程仓库
```bash
  git push origin master
```

# 三、使用Jenkins进行持续构建持续集成
## （一）、服务器安装JDK

## （二）、服务器安装Jenkins