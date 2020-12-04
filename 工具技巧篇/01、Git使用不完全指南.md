# 一.常用命令

- `git init` 初始化一个本地仓库，会在当前文件夹下生成一个.git 文件包
- `git add ./<file>` 提交本地内容到暂缓区，`.`表示全部提交，`file`表示提交的文件名
- `git commit -m"xxxx"` 将暂缓区内容提交到本地仓库并进行备注
- `git status` 查看本地内容状态
- `git reset --hard HEAD^` 本地回退到上一个版本
- `git reset --hard 版本号` 本地回退到具体的版本
- `git log` 查看提交的 commit 版本日志，但查看不到回退过的版本记录，即 commit 后回退了，该次 commit 记录查看不到
- `git reflog` 查看所有的版本操作日志，方便查看每个操作步骤所在的版本,可以根据版本号自由前进后退
- `git checkout -- <file>` 撤销在工作区的修改，回到和版本库一样的状态
- `git branch 分支名` 创建分支
- `git branch` 查看本地分支情况
- `git checkout 分支名` 切换分支
- `git checkout -b 分支名` 创建并切换分支
- `git merge 分支名` 合并某分支到当前分支
- `git stash` 把工作现成隐藏暂存起来
- `git stash pop` 恢复隐藏暂存的内容
- `git remote add origin 远程仓库地址` 将远程仓库和本地仓库进行关联
- `git remote -v` 查看本地仓库对应的远程仓库
- `git clone 远程仓库地址` 将远程仓库内容克隆到本地
- `git pull`
- `git push origin 分支名` 将本地分支推送到远程,远程仓库就创建了该分支
- `git checkout -b dev origin/dev` 将远程 dev 分支拉取到本地，并在本地创建 dev 分支和远程 dev 分支进行关联

# 二.从零开始搭建项目仓库

> 在项目开发中，为了代码安全和方便多人协作开发，我们通常会使用代码托管工具对代码进行管理。在这里我们使用 Github 作为远程代码共享库。下面我们就从零开始搭建一个远程仓库，并和本地 GIT 仓库进行关联。具体步骤如下：

## 1. 创建 SSH Key

因为本地的 Git 仓库和远程 Github 仓库之间是通过 SSH 加密进行传输的，因此需要先设置 SSH Key。
设置 SSH Key 步骤：

- 1.1 在 C 盘用户(USER)目录下找到`.ssh`文件夹，查看是否有`id_rsa`和`id_rsa.pub`这两个文件;
- 1.2 如果没有，执行`ssh-keygen -t rsa –C “xxxx@example.com”` 一路回车生成公钥和私钥文件，`id_rsa`是私钥，`id_rsa.pub`是公钥；

## 2. 登录 Github，设置 SSH Key

- 2.1 登录 GIthub，以此选择`Setting` - `SSH and GPG keys`, 然后选`New SSH key`按钮
- 2.2 填写任意 title(尽量有意义)，将第一步生成文件`id_rsa.pub`中的内容复制进 Key 中，添加即可。

## 3. 在 Github 中创建一个远程仓库

在 Github 右上角找到+号，选择`new repository`,填写相关信息后创建仓库，至此，远程仓库就创建完毕了。

## 4. 将远程仓库和本地仓库进行关联,并将本地代码推送到远程仓库

将远程仓库和本地仓库进行关联分两种情况：
4.1 本地仓库还未创建
此时，只需要在本地项目文件夹中使用`git clone 远程仓库项目地址` 将远程仓库克隆到本地，因为此时远程仓库时空的，克隆下拉只有一个`.git`文件夹.这样就把本地仓库和远程仓库进行关联了，就可以在本地写项目代码。
4.2 本地仓库已创建

- 001 初始化本地仓库
  `git init`
- 002 将本地仓库和远程仓库进行关联
  ` git remote add origin 远程仓库项目地址`
- 003 将本地代码添加到暂缓区
  ` git add .`
- 004 将暂缓区代码上传到本地仓库
  `git commit -m"xxxxx"`
- 005 将本地仓库代码推送到远程仓库
  `git push -u origin master`
  > 使用`git push -u origin master` 就可以将本地仓库推送到远程仓库，注意因为初始状态时远程仓库时空的，加上`-u`, `git`不但会把本地的`master`分支内容推送的远程新的`master`分支，还会把本地的`master`分支和远程的`master`分支关联起来，在以后的推送或者拉取时就可以简化命令.

`注意`:通常执行 005 后会报错，因为本地分支版本低于远程，因此需要更新。需要执行：`git pull --rebase origin master` ，然后再执行 005 就成功了。

# 三.场景处理

## 1、在当前版本更新了内容，需要放弃文件修改

① 未 add 到暂缓区之前

- 放弃部分文件修改
  ```
    git checkout -- 文件名
  ```
- 放弃全部文件修改
  ```
    git checkout .
  ```
  `ps`: 在切换分支的时候如果遇到切换到新分支后很多文件被修改，可以使用该方法放弃修改。

② 已经 add 到了暂缓区

- 放弃部分文件修改
  ```
    git reset HEAD 文件名
  ```
- 放弃全部文件修改
  ```
    git reset HEAD .
  ```
  ③ 已经 commit 到了暂缓区
- 回退版本
  ```
    git reset --hard HEAD^
  ```

## 2、在当前工作的分支上正在工作，但工作没做完无法提交，突然后紧急 bug 需要修复，该如何处理

- 情景描述：
  > 因为是紧急任务，而当前分支的工作也短时间内无法完成，因此无法在当前分支进行处理，需要重开新的分支单独处理 bug 问题。
- 解决办法：
  > 使用`git stash`命令先将当前任务暂存起来，然后当然分支就是干净了，就可以切换新的分支，当把新的分支 bug 修复完提交以后，就可以切换回这个分支，在使用`git stash pop`命令将暂存内容恢复，然后继续处理当前任务。

## 3、新建`dev`分支，将`master`代码拷贝到`dev`分支，在`dev`分支进行开发。具体步骤如下：

1)、新建本地`dev`分支并切换至`dev`分支

```
git checkout -b dev
```

2)、将本地`master`代码合并到`dev`分支

```
git merge master
```

3)、将本地`dev`分支推送到远程，并在远程创建`dev`分支

```
git push origin dev
```

此时，远程`dev`分支创建成功,代码也同步成功。

## 4、删除分支

- 删除本地`dev`分支

```
git branch -d dev
```

- 删除远程`dev`分支

```
git push origin --delete dev 或 git push origin -d dev
```

- 删除全部远程已经删除过的本地分支

```
git remote prune origin
```

## 5、本地其他开发者远程拉取`dev`分支，并切换至`dev`分支

1)、 将远程分支信息拉取到本地

```
git fetch
```

- 如果远程仓库没有的分支，但是本地`remotes`中看到还有，可以使用如下命令清除：

```
 git remote prune origin
```

- 如果远程仓库存在的`dev`分支，`git fetch`之后在`remotes`中可以看到，本地没有，可以使用如下命令同步：

```
git checkout -b dev origin/dev
```

2)、查看远程所有分支信息

```
git branch -a
```

3)、切换分支

```
git checkout dev
```

## 6、已提交至远程的代码发现有问题需要回退到上一个版本

1)、本地回退

```
git reset --hard HEAD^
```

2)、推送远程

```
git push -f
```

## 7、版本上线前打 tag

1)、新建 tag
切换至对应的上线分支：

```bash
git tag -a web_1.4.0.20201127_beta -m"更新需求"
```

2)、推送 tag 至远程仓库

```bash
git push origin web_1.4.0.20201127_beta
```

3)、查看所有 tag

```bash
git tag --list
```

4)、删除 tag

```bash
// 删除本地
git tag -d web_1.4.0.20201127_beta
// 删除远程
git push origin :refs/tags/web_1.4.0.20201127_beta
```
