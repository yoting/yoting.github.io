---
layout: post
title: Maven的settings文件
date: 2016-11-30
categories: "Common_Utils"
tags: maven
---
　　maven是构建工具，最大的便利之处就是帮助我们管理jar包依赖，当然还有其他一些方面的功能，比如打包，项目依赖等等。这里不做过多介绍maven，想要使用maven这把利器，首先需要下载安装然后配置，maven的全局配置文件，位于maven_home/conf/settings.xml，一般我们会配置自己的本地仓库以及组织得私服地址。接下来简单介绍配置自己的maven工具。主要是settings文件的各个标签元素。

```xml
<?xml version="1.0" encoding="UTF-8"?>
<settings xmlns="http://maven.apache.org/SETTINGS/1.0.0"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/SETTINGS/1.0.0 http://maven.apache.org/xsd/settings-1.0.0.xsd">
    <!-- 指定本地仓库地址 -->
    <localRepository>E:/develop/mavenRepertory</localRepository>

    <!-- 不用配置 -->
    <pluginGroups></pluginGroups>

    <!-- 不用配置 -->
    <proxies></proxies>

    <!-- 指定每个私服仓库的账号信息 -->
    <servers>
        <server>
            <id>nexus-releases</id>
            <username>admin</username>
            <password>admin123</password>
        </server>
        <server>
            <id>nexus-snapshots</id>
            <username>admin</username>
            <password>admin123</password>
        </server>
    </servers>

    <!-- 镜像，不用配置 -->
    <mirrors>
    </mirrors>

    <!-- 属性配置，可以配置多个，每一个需要有一个id，以便于激活指定id对应得属性配置 -->
    <profiles>
        <profile>
            <id>nexus</id>
            <!-- 一般可以在这配置私服地址信息 -->
            <repositories>
                <repository>
                    <id>nexus-central</id>
                    <name>nexus</name>
                    <url>http://127.0.0.1:9005/nexus/content/groups/public/</url>
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
                    <url>http://127.0.0.1:9005/nexus/content/groups/public/</url>
                    <releases>
                        <enabled>true</enabled>
                    </releases>
                    <snapshots>
                        <enabled>true</enabled>
                    </snapshots>
                </pluginRepository>
            </pluginRepositories>
        </profile>
        <profile>
            <id>downloadSources</id>
            <properties>
                <downloadSources>true</downloadSources>
                <downloadJavadocs>true</downloadJavadocs>
            </properties>
        </profile>
    </profiles>

    <!-- 选择要激活的属性配置，也可在执行mvn命令的时候使用-Pid激活 -->
    <activeProfiles>
        <activeProfile>nexus</activeProfile>
        <activeProfile>downloadSources</activeProfile>
    </activeProfiles>
</settings>
```

　　一般我们主要的配置是自己本地仓库的存放位置，以及私服地址。