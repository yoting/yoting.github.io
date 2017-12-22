---
layout: post
title: Maven的pom文件
date: 2015-05-20
categories: "Overall"
tags: maven
---
　　maven是构建工具，最大的便利之处就是帮助我们管理jar包依赖，当然还有其他一些方面的功能，比如打包，项目依赖等等。这里不做过多介绍maven，而maven的核心就是pom.xml文件。接下来就对pom文件进行简单说明，主要是xml文件的各个标签进行介绍。

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <groupId>com.gusi.demo</groupId>
    <artifactId>DemoJar</artifactId>
    <version>0.0.1</version>
    <packaging>jar</packaging>
    <!-- 基本信息，包括坐标，版本以及打包类型，一般打包都是jar或者war，如果是模块聚合打包需要为pom -->

    <name>DemoJar</name>
    <url>http://maven.apache.org</url>
    <description>package jar to nexus</description>
    <!-- 基本描述信息，没有实际意义，可以不要 -->

    <!-- <modules> -->
    <!-- <module>xxx</module> -->
    <!-- </modules> -->
    <!-- 如果是父子模块聚合，需要用到该元素，表示聚合模块得子模块构成 -->

    <developers>
        <developer>
            <email>dyy_gusi@sina.com</email>
            <name>gusi</name>
        </developer>
    </developers>
    <!-- 开发者信息，没有实际意义，可以不要 -->

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <project.environment>local</project.environment>
    </properties>
    <!-- 配置通用属性，类似全局变量 -->

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
    <!--私服地址， jar包资源和插件资源的本地私服地址，也可以配置在settings文件中，避免每个项目都配置该地址 -->

    <distributionManagement>
        <repository>
            <id>nexus-releases</id>
            <name>Nexus Release Repository</name>
            <url>http://127.0.0.1:9005/nexus/content/repositories/releases/</url>
        </repository>
        <snapshotRepository>
            <id>nexus-snapshots</id>
            <name>Nexus Snapshot Repository</name>
            <url>http://127.0.0.1:9005/nexus/content/repositories/snapshots/</url>
        </snapshotRepository>
    </distributionManagement>
    <!-- 部署到私服，其中id需要在setting文件得server元素中声明，release和snapshots分别表示部署得不同的位置 -->

    <profiles>
        <profile>
            <id>environment_lan</id>
            <properties>
                <project.environment>lan</project.environment>
            </properties>
        </profile>
    </profiles>
    <!-- 配置属性文件，执行命令的时候（-Penvironment_lan），可以选择激活执行某个id的配置，从而选择使用指定的配置 -->

    <dependencyManagement>
        <dependencies>
            <dependency>
                <artifactId>junit</artifactId>
                <groupId>junit</groupId>
                <version>4.12</version>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <!-- 依赖管理，父子模块中使用，在父模块中声明使用得jar包以及版本，那么在子模块中就只需要声明使用该jar包，不需要指定版本，因为在父模块中已经确定，这样可以保证所有得子模块都使用得是同个jar包，防止包冲突 -->

    <dependencies>
        <dependency>
            <groupId>junit</groupId>
            <artifactId>junit</artifactId>
        </dependency>
    </dependencies>
    <!-- 依赖，如果已经再dependenciesManagement中声明，这里就不再需要指定版本，依赖中还可以执行排除依赖以及依赖的适用范围，通过<exclusions>,<scope>标签确定 -->

    <build>
        <finalName>DemoJar</finalName>
        <pluginManagement>
            <plugins>
                <plugin>
                    <groupId>org.apache.tomcat.maven</groupId>
                    <artifactId>tomcat7-maven-plugin</artifactId>
                    <version>2.2</version>
                </plugin>
            </plugins>
        </pluginManagement>
        <plugins>
            <plugin>
                <groupId>org.apache.tomcat.maven</groupId>
                <artifactId>tomcat7-maven-plugin</artifactId>
                <configuration>
                    <path>/test</path>
                    <port>9003</port>
                    <contextReloadable>false</contextReloadable>
                </configuration>
            </plugin>
        </plugins>
    </build>
    <!-- 构建，插件指定，plugins和pluginsManagment的关系和依赖管理的原理相同，finalName表示最终构建的名字 -->

</project>
```
　　对于每个标签元素更详细具体的使用方式，比如依赖的范围scope的取值以及意义，plugin的作用等等。不在此叙述！
