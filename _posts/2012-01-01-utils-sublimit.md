---
layout: post
title: sublimit编辑器使用介绍
date: 2017-04-19
categories: "Common_Utils"
tags: sublimit
---
　　sublime text是个超级好用的文本编辑器，再配合上一些插件使用，简直爽到爆。那么问题来了，插件如何安装，我们首先是安装一个安装插件的插件——PackageControl，有了它，想安装什么插件就安装什么插件。那么如何安装Package Control呢?

#### **安装Package Control**
- [https://packagecontrol.io/installation#st2](https://packagecontrol.io/installation#st2)

- PackageControl第一种方式安装：通过执行一段命令代码自动安装。
    - 1、上面网址有查看对应的代码.
    - 2、复制上面的代码，然后打开sublime text3控制台（view->Show/Hide Console），将上面的代码复制到控制台的输入框，然后回车确定。此时会自动安装。

- PackageControl第二种方式安装：通过下载安装文件，放到合适的位置。
    - 1、下载文件“Package Control.sublime-package”,上面的网址提供下载。
    - 2、将刚刚下载的文件放到合适的位置。首选项（Preferences->Browse package...）进入到本地文件夹（..\Sublime Text 2\Packages），回退一级然后找到Installed Packages文件夹，进入该文件夹（..\Sublime Text 2\Installed Packages），再将刚刚下载的文件放在该文件夹下。
    - 3、如果是sublimit text3，直接放在安装目录下的Pakcages目录下。

- 检测是否安装成功:关闭编辑器，重新打开，点击首选项（Preferences），看是否多出一个Package Control选项，如果存在表示安装成功。

#### **SublimeText安装插件以及设置属性**
- 安装插件的方式：ctrl+shift+p，打开命令面板
- 输入"install",会弹出提示框需要安装的插件名称,再输入想安装的插件
- 输入"json"或者其他比如"java",可以这是文本的显示语法
- 设置各种属性：点击首选项(Preferences)->设置(Setting)，其中加入以下代码："font_size": 13,或者加入其它属性的设置等等
- 如果想关闭每次启动时候弹出自动更新，只需要加上以下代码："update_check": false
- 注意每个设置之间的逗号哦。其所有的配置都是以json的方式书写即可。当然还有很多其他属性都可以通过该种方式设置。

#### **推荐插件**
- ConvertToUTF8:中文乱码解决插件，防止中文显示乱码。
- HTML-CSS-JS Prettify:代码格式化插件，可以调整Js,HTML,css,JSON文本内容的格式.默认快捷键：Ctrl+Shift+H,如果提示你没有安装Node.js，下载安装Node.js，然后修改Node.js指向路径就可以。
- IMESupport:支持输入法跟随光标
