---
layout: post
title: Java开发环境搭建
date: 2014-07-01
categories: Java
tags: java环境变量
---

　　接下来我们将开启我们的java编程之旅，路漫漫其修远兮！

**1、概念解释以及jdk安装**

- jre:java runtime environment Java运行环境。jre=jvm(java虚拟机)+Java类库。
- jdk：java development kits Java开发工具包。jdk=jre+java开发工具。

&ensp;&ensp;&ensp;&ensp;运行Java程序只需要有jre即可，jdk是专门为开发人员使用的。首先在开发机器上下载并安装jdk。

**2、配置环境变量Path**

&ensp;&ensp;&ensp;&ensp;在开发之前需要配置环境变量：

- JAVA_HOME=C:\Program Files\Java\jdk1.7.0 (jdk安装目录)
- Path=%JAVA_HOME%\bin;%JAVA_HOME%\jre\bin; (在系统路径下加入)
- CLASSPATE=.;%JAVA_HOME%\lib\dt.jar;%JAVA_HOME%\lib\tools.jar;

&ensp;&ensp;&ensp;&ensp;当然，可以不用配置JAVA_HOME,配置它只是为了配置Paht和CLASSPATE的时候方便

- Path：系统路径，使得Java内部指令可以在任何路径运行（比如javac命令）。如果没有配，那就只能在jdk的安装目录下运行javac命令。
- Classpath：类路径，使得.class文件可以在特定的位置运行（比如java xxx.classpath），前面的”.;”表示当前路径，要是在当前路径找不到，就到指定的路径下面找。

&ensp;&ensp;&ensp;&ensp;配置临时环境变量，在命令行窗口中输入以下命令:

- set paht   查看当前Paht
- set paht=  清空当前的Paht
- set Paht=d:\myfile  配置临时的Paht
- set paht=d:\myfile;%paht%  在当前的Paht前面加入自己的Paht路径

&ensp;&ensp;&ensp;&ensp;配置Classpath和配置Paht相同，需要注意的是所有的临时变量只在当前窗口有效。

**3、开发第一个helloworld程序**

&ensp;&ensp;&ensp;&ensp;编写helloworld程序如下：

```java
public class HelloWorld{
    public static void main(String[] args){
        System.out.println("hello java");
    }
}
```

&ensp;&ensp;&ensp;&ensp;保存上面的程序HelloWorld.java，然后在其目录下的命令中中输入以下命令以执行上面的程序：

```java
 javac HelloWorld.java
 java HelloWorld

//out:hello java
```

&ensp;&ensp;&ensp;&ensp;尽量保证文件名称和class定义的名称相同，当class前面没有public时，可以不同可以相同，但是前面要是有public时，文件名和class名称必须相同

**4、下载IDE集成开发环境**

&ensp;&ensp;&ensp;&ensp;可以使用eclipse，myeclipse，intelljIdea等。
