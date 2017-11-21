---
layout: post
title: Maven的私服nexus搭建和使用
date: 2016-11-30
categories: "Common_Utils"
tags: maven
---
　　maven是构建工具，最大的便利之处就是帮助我们管理jar包依赖，当然还有其他一些方面的功能，比如打包，项目依赖等等。这里不做过多介绍maven。对于其主要功能管理jar包的依赖，这里简单叙述一二。maven在安装以后，都对应我们本地有一个仓库，仓库里有我们需要个各种jar包资源和插件资源以及其他资源等。那这些资源又从那里来？从一个叫中央仓库的地方，这个中央仓库大家都能用，有需要就可以从上面拉取东西。但是如果我们每次在用到一个jar包的时候都从中央仓库拉取，肯定很慢，所以就诞生了私服。私服的存在让我们每次需要的资源先从我们自己的私服上找，如果找到就直接从我们自己的私服上拉取资源，如果没找到就先从中央仓库将资源拉取到我们的私服上，再从私服上拉取到我们本地。这样就可以避免同一个资源每次都从中央仓库拉取。另一个主要原因是可能在组织或公司里，有些资源是公司私有的，自由公司成员才能拿到，不能也不需要发布到公网让大家都能看到。那么中央仓库中肯定没有，这个时候我们就可以存放在我们自己的私服上，那么就能保证公司内部无忧使用而外部中央仓库没有该私有资源。说到底就是要搭建个私服，接下来就按步骤搭建私服并且在maven中配置自己的私服。

- **私服的搭建**
	- 1、下载nexus，windows系统下下载的是nexus-2.14.1-01-bundle.zip文件，然后解压，得到sonatype-work和nexus-2.14.1-01文件夹，其中nexus-2.14.1-01是nexus的软件运行依赖得文件，sonatype-work是私服资源得存放文件夹。
	- 2、修改配置，在nexus-2.14.1-01文件夹下可以配置私服地址端口以及其他信息，配置文件为：nexus.properties
	- 3、启动nexus，在nexus-2.14.1-01/bin下有命令文件nexus.bat。在cmd管理员模式下执行nexus.bat install执行安装，完成后执行nexus.bat start启动，执行enxus.bat stop停止运行，执行nexus.bat restart重启，执行nexus.bat uninstall卸载。
	- 4、登陆管理，启动完成以后，直接在浏览器输入：localhost:8081/nexus进入管理页面，默认端口是8018，默认账号密码是admin/admi123

- **私服的使用**
　　如果首先从私服上下载jar包或者插件，需要在项目得pom中加入以下配置信息：

```xml
    <repositories>
        <repository>
            <id>nexus-central</id>
            <name>nexus</name>
            <url>http://127.0.0.1:8081/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </repository>
    </repositories>
    <pluginRepositories>
        <pluginRepository>
            <id>nexus-plugin</id>
            <name>nexus</name>
            <url>http://127.0.0.1:8081/nexus/content/groups/public/</url>
            <releases>
                <enabled>true</enabled>
            </releases>
            <snapshots>
                <enabled>true</enabled>
            </snapshots>
        </pluginRepository>
    </pluginRepositories>
    <!--私服地址， jar包资源和插件资源的本地私服地址，也可以配置在settings文件中，避免每个项目都配置该地址 -->
```

　　在项目依赖别的资源的时候，首先会从mavne本地仓库找，如果没有就再从私服上下载，如果还没有，就从远程中央仓库先下载到私服上，再从私服下载到本地仓库中。

　　如果要上传资源到私服上，需要再pom中加入以下配置信息：

```xml
    <distributionManagement>
        <repository>
            <id>nexus-releases</id>
            <name>Nexus Release Repository</name>
            <url>http://127.0.0.1:8081/nexus/content/repositories/releases/</url>
        </repository>
        <snapshotRepository>
            <id>nexus-snapshots</id>
            <name>Nexus Snapshot Repository</name>
            <url>http://127.0.0.1:8081/nexus/content/repositories/snapshots/</url>
        </snapshotRepository>
    </distributionManagement>
    <!-- 部署到私服，其中id需要在setting文件得server元素中声明，release和snapshots分别表示部署得不同的位置 -->
```

　　在资源上传得时候，执行deploy命令，会依据资源是snapshots还是release，选择不同得上传地址，其实判断依据就是资源版本名称version，如果带有SNAPSHOS就会传到snaapshots目录下，否则传到releases目录下。

