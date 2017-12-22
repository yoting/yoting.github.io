---
layout: post
title: slf4j介绍
date: 2015-03-01
categories: "Overall"
tags: slf4j
---

　**slf4j(simple logging facade for java)**是Java的简单的日志门面，它不是具体的日志解决方案，它只服务于各种各样slf4j-log的日志系统。这里的slf4j-log可以是log4j，可以是jdk的日志，可以是logback，还可以是slf4j-simple等等。按照官方的说法，SLF4J是一个用于日志系统的简单Facade，允许最终用户在部署其应用时使用其所希望的日志系统。这里其实用到了一种设计模式（Facade设计模式，门面设计模式）。如下图：
![slf4j](/assets/yoting/post/commonUtils/01.png)

　实际上，SLF4J所提供的核心API是一些接口以及一个LoggerFactory的工厂类。而在使用SLF4J的时候，不需要在代码中或配置文件中指定你打算用那个具体的日志系统。只需要在项目中加入定的slf4j-log.jar包就可以。这个和Spring的IOC思想有点像，想用哪个就用哪个，随意切换。使用slf4j这种记录日志的方式的特点很明显：

- **1、**如果我们需要记录的是底层类库或者组件这种东西，就可以不影响或强制要求用户选择哪种日志系统。

- **2、**如果我们用特定的日志系统写了代码，但是有一天要求换另一种日志系统，如果之前就用slf4j的api写的，那就很简单，直接更换项目的log框架即可。但是如果用具体的一种方式写了以后，那在切换就很麻烦，必须修改原来记录日志的代码。

在代码中的使用示例：

```java
import org.slf4j.Logger;  
import org.slf4j.LoggerFactory;  

public class Slf4jTest {  
    // 首先获得日志记录这个对象 ，这里一定要用slf4j的类或者接口，不要用具体实现框架的类或者接口
    static private Logger logger = LoggerFactory.getLogger(Slf4jTest.class);  

    public static void main(String[] args) {  
        // 记录error信息  
        logger.error("[info message]");  
        // 记录info，还可以传入参数  
        logger.info("[info message]{},{},{},{}", "abc", false, 123,  
                new Slf4jTest());  
        // 记录deubg信息  
        logger.debug("[debug message]");  
        // 记录trace信息  
        logger.trace("[trace message]");  
        System.out.println("hello world");  
    }  
}  
```

具体使用哪种日志系统，这个可以随意切换。切换日志系统只需要将响应的框架包放到类路径下即可。演示如下：

- 1、使用slf4j的simple日志系统：
    在classpath中加入：slf4j-simple.jar,运行程序输入如下：

```java
[main] ERROR com.swu.gusi.Slf4jTest - [info message]
[main] INFO com.swu.gusi.Slf4jTest - [info message]abc,false,123,com.swu.gusi.Slf4jTest@503f0b70
hello world
```

- 2、切换成jdk的日志系统：
    在classpath中将slf4j-log.jar换成slf4j-jdk.jar,运行程序如下：

```java
九月 20, 2014 12:33:52 下午 com.swu.gusi.Slf4jTest main
严重: [info message]
九月 20, 2014 12:33:52 下午 com.swu.gusi.Slf4jTest main
信息: [info message]abc,false,123,com.swu.gusi.Slf4jTest@400da341
hello world
```

- 3、切换成log4j的日志系统：
    ​在classpath中将slf4j-log.jar换成slf4j-log4j.jar，注意这在使用log4j的时候，需要自己配置log4j.properites文件或者log4j.xml。至于log4j的使用查阅其他文档。

- 4、切换成logback的日志系统：
    在classpath中将slf4j-log.jar换成logback-core.jar+logback-classic.jar，在使用logback的时候，需要自己配置logback.xml文件定义日志输出的样式等等。

- 5、如果classpath中有多种日志系统，会怎么样呢。会提示类似如下信息（但是最好别最好别这样搞）：

```java
SLF4J: Class path contains multiple SLF4J bindings.
SLF4J: Found binding in [jar:file:/E:/Repository/org/slf4j/slf4j-simple/1.7.7/slf4j-simple-1.7.7.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: Found binding in [jar:file:/E:/Repository/org/slf4j/slf4j-jdk14/1.7.7/slf4j-jdk14-1.7.7.jar!/org/slf4j/impl/StaticLoggerBinder.class]
SLF4J: See http://www.slf4j.org/codes.html#multiple_bindings for an explanation.
SLF4J: Actual binding is of type [org.slf4j.impl.SimpleLoggerFactory]
[main] ERROR com.swu.gusi.Slf4jTest - [info message]
[main] INFO com.swu.gusi.Slf4jTest - [info message]abc,false,123,com.swu.gusi.Slf4jTest@10e80317
hello world
```
