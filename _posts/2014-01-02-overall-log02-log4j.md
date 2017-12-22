---
layout: post
title: log4j介绍
date: 2015-03-03
categories: "Overall"
tags: log4j
---
&ensp;&ensp;&ensp;&ensp;Log4j是Apache的一个开放源代码项目，通过使用Log4j，我们可以控制日志信息输送的目的地是控制台、文件、GUI组件，甚至是套接口服务器、NT的事件记录器、UNIX Syslog守护进程等；我们也可以控制每一条日志的输出格式；通过定义每一条日志信息的级别，我们能够更加细致地控制日志的生成过程。最令人感兴趣的就是，这些可以通过一个配置文件来灵活地进行配置，而不需要修改应用的代码。那么如何使用log4j为我们记录日志信息呢？只需要两个步骤，就可以灵活的完成日志记录到指定的地方。

### **第一部分：Log4j解释和使用演示**

- 第一步：配置log4j文件，这里有两种配置格式，一种是使用properties文件中的键值对方式，另一种是使用xml。一般都使用log4j.properties文件配置。在纯Java项目中，将这个文件放在src下面就可以了。下面是log4j.properties文件：在后面详细解释这个配置文件

```xml
#配置根日志
log4j.rootLogger=trace,Console
log4j.appender.Console = org.apache.log4j.ConsoleAppender
log4j.appender.Console.Target = System.out
log4j.appender.Console.layout = org.apache.log4j.PatternLayout
log4j.appender.Console.layout.ConversionPattern = %d{yyyy-MM-dd HH:mm:ss} %l <%p> %m%n

#配置特定包下的日志
log4j.logger.com.swu.gusi=debug,A1
log4j.appender.A1 = org.apache.log4j.ConsoleAppender
log4j.appender.A1.Target = System.out
log4j.appender.A1.layout = org.apache.log4j.PatternLayout
log4j.appender.A1.layout.ConversionPattern = A1:%d{yyyy-MM-dd HH:mm:ss} %l <%p> %m%n
```

- 第二步：在程序代码中使用logger对象记录日志信息到指定的地方。

```java
package com.swu.gusi;  

import org.apache.log4j.Logger;  

public class Log4jTest {  
    // 得到一个logger对象，用以写日志  
    static Logger logger = Logger.getLogger(Log4jTest.class);  

    public static void main(String[] args) {  
        // logger.setLevel(Level.ERROR);  
        logger.fatal("[fatal message]");  

        logger.error("[error message]");  

        logger.warn("[warn message]");  

        logger.info("[info message]");  

        logger.debug("[debug message]");  

        logger.trace("[trace message]");  

        System.out.println("hello wrold");  
    }  
}  
```

输出信息：

```java
A1:2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:11) <FATAL> [fatal message]
2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:11) <FATAL> [fatal message]
A1:2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:13) <ERROR> [error message]
2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:13) <ERROR> [error message]
A1:2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:15) <WARN> [warn message]
2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:15) <WARN> [warn message]
A1:2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:17) <INFO> [info message]
2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:17) <INFO> [info message]
A1:2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:19) <DEBUG> [debug message]
2014-09-20 19:08:06 com.swu.gusi.Log4jTest.main(Log4jTest.java:19) <DEBUG> [debug message]
hello wrold
```

### **第二部分：log4j配置解释**

&ensp;&ensp;&ensp;&ensp;配置文件的作用总结就是：*告诉Log4J 把什么样的信息、以什么样的格式、输出到什么地方*。这样就可以很灵活的修改日志的输出格式，位置等等。

&ensp;&ensp;&ensp;&ensp;Log4j主要由3部分组成：**Loggers**(记录器)，**Appenders** (输出源)和**Layouts**(布局)，这里可简单理解为日志类别，日志要输出的地方和日志以何种形式输出。综合使用这三个组件可以轻松的记录信息的类型和级别，并可以在运行时控制日志输出的样式和位置。下面对三个组件分别进行说明：

<h4>1、loggers：记录器</h4>
&ensp;&ensp;&ensp;&ensp;这里表示日志记录的级别，这里从高到低的级别是fatal>error>warn>info>debug>trace.分别用来指定这条日志信息的重要程度。log4j对logger级别的使用是如果设置的级别为level1，那么所有的比level1高的日志信息将显示，但是比level1低的级别日志信息将被屏蔽掉不显示，比如设置级别为warn级别，那么fatal和error以及warn级别的日志信息将输出，但是info和dubug级别的日志信息被屏蔽掉将不会输出。这个基本是配置在log4j.proterites文件中，当然也可在程序中设计这个级别。语法如下：

```xml
#配置根路径logger，所有的包路径下的日志都会使用这个logger
log4j.rootLogger = [ level ] , appenderName1, appenderName2, …
#配置packagePath路径下logger，只有packagePath路径下的日志才会使用这个logger
log4j.logger.packagePath=[level],appenderName1,appenderName2,...
```

&ensp;&ensp;&ensp;&ensp;我们可以配置一个公用的根路径的logger，也可以给不同的包路径下配置不同的logger。[level]表示日志记录级别，就是上面说到的fatal或者error等级别。后面的appenderName都是appender，这个可以配置多个不同的appender，表示需要将日志输出到不同的位置。appenderName这个名字是可以随便写的，只要在之后的配置中相同就可以，下面将会说明appender的配置。具体配置logger示例如下：

```xml
#配置logger的级别为info,同时配置输出到Consele和File两个appender
log4j.rootLogger = info , Console，File
```

<h4>2、appenders：输出源</h4>
&ensp;&ensp;&ensp;&ensp;这里表示日志记录输出位置，我们输出到控制台、文件、甚至是自己写的输出到指定位置等等。语法如下：

```xml
#配置appender对应的输出位置
log4j.appender.appenderName = fully.qualified.name.of.appender.class
#配置N个不同的可选参数信息，每一个appender的可选参数配置可能不同
log4j.appender.appenderName.option1 = value1
…
log4j.appender.appenderName.option = valueN
```

&ensp;&ensp;&ensp;&ensp;这里只需要指定对应appender的全类名，然后再配置这个appender的一些其他的信息即可。这里配置一个appender的其他信息的时候，可以配置多个不同的其他信息，比如配置输出到文件的时候需要配置文件的位置，书写方式等等信息。具体配置appender示例如下：

```xml
#首先配置logger
log4j.rootLogger = info , console，file
#接着配置分别两个appender：console和file
log4j.appender.console=org.apache.log4j.ConsoleAppender
#配置Console的其他可选信息
log4j.appender.console.Target = System.out
#配置File的appender和上面的基本相同，只是有写自己的可选配置不同
log4j.appender.file =org.apache.log4j.FileAppender
#配置File的书写方式是追加在文件末尾还是覆盖重写，默认是追加的方式
log4j.appender.file.Append=false
#配置File输出文件的文件位置
log4j.paaender.file.File=C:/logFile.txt
```

&ensp;&ensp;&ensp;&ensp;上面的详细配置示例是用到了控制台可文件，当然还有其他各种各种的appender供我们使用：（appender的类全名-appender下的选项参数配置）

- org.apache.log4j.ConsoleAppender（输出到控制台）
        Threshold=WARN：指定日志消息的输出最低层次
        ImmediateFlush=true:表示有消息立即输出，默认是true
        Target=Syste.err：输出到控制台，默认是System.out

- org.apache.log4j.FileAppender（输出到文件）
        Threshold=INFO
        ImmediateFlust=false
        File=C:/log.txt：输出文件位置
        Append=false：是否一追加的方式写到文件，默认是true

- org.apache.log4j.DailyRollingFileAppender（按时间设置产生一个日志文件）
        Threshold=INFO
        ImmediateFlust=false
        File=C:/log.txt：输出文件位置
        Append=false：是否一追加的方式写到文件，默认是true
        DatePattern='.'yyyy-MM-dd:每天滚动产生一个日志文件（还有其他格式：'.'yyyy-MM;'.'yyyy-ww每周;等等)

- org.apache.log4j.RollingFileAppender（安日志内容大小尺寸产生一个新日志文件）
*当日志文件达到指定大小的时，产生一个新的临时文件，当临时文件的数量达到指定数量时，产生一个完整的日志文件*
	Threshold=INFO
	ImmediateFlust=false
	File=C:/log.txt：输出文件位置
	Append=false：是否一追加的方式写到文件，默认是true
	MaxFileSize=100KB:临时文件最大尺寸，后缀可以是KB, MB 或者是 GB
	MaxBackupIndex=2:指定可以产生的滚动文件的最大数

- org.apache.log4j.WriterAppender（将日志信息以stream的形式输出到指定的位置）
*上面介绍的几种appender其实都是WriterAppender的子类*

　　上面只是列出了一些比较常用的appender和对应的appender的一些基本常用的可选配置信息，apache还给我们提供了很多其他的appender，下图可以看见所有appender。

![log4j](/assets/yoting/post/commonUtils/02.png)

<h4>3、layouts：布局</h4>
&ensp;&ensp;&ensp;&ensp;这里是表示输出的格式布局，可以以html形式，自己指定的灵活布局，包含日志信息级别和信息字符串，包换日产生时间线程类别信息等等格式。语法如下:

```xml
#配置appender的layout
 log4j.appender.appenderName.layout = fully.qualified.name.of.layout.class
#配置layout的参数选项配置信息，每一个layout的可选参数配置可能不同
log4j.appender.appenderName.option1 = value1
```

&ensp;&ensp;&ensp;&ensp;我们首先给appender指定一个layout，就是给layout指定一个类。然后给这个layout配置需要的参数信息。具体的layout配置示例如下：

```xml
#首先配置logger
log4j.rootLogger = info , console，file
#接着配置分别两个appender：console和file
log4j.appender.console=org.apache.log4j.ConsoleAppender
#配置Console的其他可选信息
log4j.appender.console.Target = System.out
#配置consloe的layout
log4j.appender.console.layout=layout=org.apache.log4j.PatternLayout
#配置layout的可选参数,自定义样式
log4j.appender.console.layout.ConversionPattern=%r [%t] [%p] - %c -%l -%m%n
#配置File的appender和上面的基本相同，只是有写自己的可选配置不同
log4j.appender.file =org.apache.log4j.FileAppender
#配置File的书写方式是追加在文件末尾还是覆盖重写，默认是追加的方式
log4j.appender.file.Append=false
#配置File输出文件的文件位置
log4j.paaender.file.File=C:/logFile.txt
#配置file的layout
log4j.appender.file.layout=org.apache.log4j.HTMLLayout
log4j.appender.file.layout.Title=testTitle
```

&ensp;&ensp;&ensp;&ensp;上面只是用到了Pattrenlayout和HTMLLayout，还有一些其他的layout供我们使用：（layout类全名－layout下的参数配置）

- org.apache.log4j.PatternLayout(可灵活的指定布局模式)
	ConVersionPattren=%m%n:指定怎样的格式化指定的消息，后面会详细说明各个字母含义

- org.apache.log4j.SimpleLayout(包含日志信息的级别和信息字符串)

- org.apache.log4j.TTCCLayout(包含日志产生时间，线程，类别等信息)

- org.apache.log4j.HTMLLayout(以HTML表格是形式布局模式)
	LocationInfo=true:输出Java文件名称和行号，默认是false
	Title=testTitle：Html标题，默认是Log4j Log Message
    ​
ConversionPattern的各个参数说明：

```xml
－: 信息输出时左对齐；
 %p: 输出日志信息级别，即DEBUG，INFO，WARN，ERROR，FATAL,
 %d: 输出日志时间点的日期或时间，默认格式为ISO8601，也可以在其后指定格式，比如：%d{yyy MM dd HH:mm:ss}
 %r: 输出自应用启动到输出该log信息耗费的毫秒数
 %c: 输出日志信息所属的类目，通常就是所在类的全名
 %t: 输出产生该日志事件的线程名
 %l: 输出日志事件的发生位置，相当于%c.%m(%f:%l)的组合,包括类名、发生的线程，以及在代码中的行数。举例：Log4jTest.main(Log4jTest.java:10)
 %x: 输出和当前线程相关联的NDC(嵌套诊断环境),尤其用到像java servlets这样的多客户多线程的应用中。
 %%: 输出一个"%"字符
 %f: 输出日志消息产生时所在的文件名称
 %l: 输出代码中的行号
 %m: 输出代码中指定的消息,产生的日志具体信息
 %n: 输出一个回车换行符，Windows平台为"\r\n"，Unix平台为"\n"输出日志信息换行
 可以在%与模式字符之间加上修饰符来控制其最小宽度、最大宽度、和文本的对齐方式。如：
 1)%20c：指定输出category的名称，最小的宽度是20，如果category的名称小于20的话，默认的情况下右对齐。
 2)%-20c:指定输出category的名称，最小的宽度是20，如果category的名称小于20的话，"-"号指定左对齐。
 3)%.30c:指定输出category的名称，最大的宽度是30，如果category的名称大于30的话，就会将左边多出的字符截掉，但小于30的话也不会有空格。
 4)%20.30c:如果category的名称小于20就补空格，并且右对齐，如果其名称长于30字符，就从左边超出的字符截掉。
```

&ensp;&ensp;&ensp;&ensp;​上面的表格中只是列出了一些比较常用的layout和对应的layout的一些基本常用的可选配置信息，apache还给我们提供了很多其他的layout，下图可以看见所有apache提供的layout。

![log4j](/assets/yoting/post/commonUtils/03.png)

### **第三部分：程序使用Log4j记录日志**

&ensp;&ensp;&ensp;&ensp;​上面已经配置好了log4j的properties配置文件，我们在Java程序中按照一下步骤操作就可以：

- 1、建立Logger实例

```java
// 得到一个logger对象，用以写日志
static Logger logger = Logger.getLogger(Log4jTest.class);
```

- 2、读取配置文件

&ensp;&ensp;&ensp;&ensp;有3中读取方式，如果我么不写，默认读取classpath下的log4j.properties文件配置logger。

```java
BasicConfigurator.configure();	//默认使用输出控制台
PropertyConfigurator.configure(String configFilename);	//读取properties文件的配置信息
DOMConfigurator.configure(Stirng filename);	//读取xml文件的配置信息
```

- 3、在需要的地方插入日志信息

```java
//致命错误
logger.fatal("[fatal message]");
//错误信息
logger.error("[error message]");
//警告信息
logger.warn("[warn message]");
//一般信息
logger.info("[info message]");
//调试信息
logger.debug("[debug message]");
//跟踪信息
logger.trace("[trace message]");
```
​
&ensp;&ensp;&ensp;&ensp;​至此，终于说完了log4j的一些基本使用方法，其实log4j还很强大，如果需要，可以查看官方文档。
