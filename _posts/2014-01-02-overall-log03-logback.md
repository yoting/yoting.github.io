---
layout: post
title: logback介绍
date: 2015-03-02
categories: "Overall"
tags: logback
---

<h3>一、logback简介以及快速使用</h3>
- **logback介绍**
　　Logback是由log4j创始人设计的又一个开源日志组件。它和log4j很像，是log4j的升级，相比log4j拥有更多的特性，同时也带来很大性能提升。在项目中将自己的日志系统更换为logback是一个不错的选择。
- **logback组成**
	- logback-core：日志组件的核心部分，要想使用该日志组件，必须拥有该jar包。
	- logback-classic：实现了slf4j的API，所以当想配合slf4j使用时，必须将该jar包加入到classpath下。
	- logback-access：为提供http访问日志的接口。  
建议使用slf4j+logback实现日志记录功能，所以我们需要做的就是将logback-core和logback-classic两个jar包导入到项目的classpath下，当然不能忘记导入slf4j-api的jar包。
- **配置logback**
　　配置logback需要将一个配置文件logback.xml或者logback-test.xml放在classpath下。如果配置文件 logback.xml 和 logback-test.xml 都不存在，那么 logback 默认地会调用BasicConfigurator ，创建一个最小化配置。最小化配置由一个关联到根 logger 的ConsoleAppender 组成。输出用模式为%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n的 PatternLayoutEncoder 进行格式化。根 logger 默认级别是 DEBUG。
　　logback.xml的配置主要包括3部分，**Appender**,**Logger**,**Root**的配置。 logback 配置文件的语法非常灵活。正因为灵活，所以无法用 DTD 或 XML schema 进行定义。尽管如此，可以这样描述配置文件的基本结构：以configuration开头，后面有零个或多个appender元素，有零个或多个logger元素，有最多一个root元素。

- **logback.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration scan="true" scanPeriod="60 seconds" debug="false">
	<contextName>myAppName</contextName><!--全局上下文名称 -->
	<timestamp key="bySecond" datePattern="yyyyMMdd'T'HHmmss" /><!-- 获取时间 -->
	<property name="name" value="myName" />    <!-- 公用属性，下面可以使用${}符号引用它 -->

	<!-- 输出到控制台 -->
	<appender name="console" class="ch.qos.logback.core.ConsoleAppender">
		<target>System.out</target>
		<encoder>
			<pattern>[%d{MM-dd HH:mm:ss.SSS}] [%-5level] %logger{35}-%msg %n
			</pattern>
		</encoder>
		<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
			<level>debug</level>
		</filter>
	</appender>

	<!-- 输出到文件，并且每天将日志内容压缩 -->
	<appender name="logFile"
		class="ch.qos.logback.core.rolling.RollingFileAppender">
		<append>true</append>
		<file>../logs/Info</file>
		<encoder>
			<pattern>[%d{MM-dd HH:mm:ss.SSS}] [%-5level] %logger{35}-%msg %n
			</pattern>
		</encoder>
		<filter class="ch.qos.logback.classic.filter.ThresholdFilter">
			<level>INFO</level>
		</filter>
		<rollingPolicy class="ch.qos.logback.core.rolling.TimeBasedRollingPolicy">
			<fileNamePattern>../logs/Info.%d{yyyy-MM-dd}.log.gz
			</fileNamePattern>
		</rollingPolicy>
	</appender>

	<!-- 指定包或者类的输出logger -->
	<logger name="cn.com.package.Clazz" level="DEBUG" addtivity="false">
		<appender-ref ref="logFile" />
	</logger>

	<!-- 根logger -->
	<root level="INFO">
		<appender-ref ref="console" />
	</root>

</configuration>
```
　　
<h3>二、logback配置文件详细说明</h3>
- **根节点configuration**：
　　包含如下属性：
	- scan:当此属性设置为true时，配置文件如果发生改变，将会被重新加载，默认值为true。
	- scanPeriod:设置监测配置文件是否有修改的时间间隔，如果没有给出时间单位，默认单位是毫秒。当scan为true时，此属性生效。默认的时间间隔为1分钟。
	- debug:当此属性设置为true时，将打印出logback内部日志信息，实时查看logback运行状态。默认值为false。

- **根节点的子节点logger**:
　　用来设置某一个包或者具体的某一个类的日志打印级别、以及指定appender。loger仅有一个name属性，一个可选的level和一个可选的addtivity属性。属性：
	- name:用来指定受此loger约束的某一个包或者具体的某一个类。
	- level:用来设置打印级别，大小写无关：TRACE, DEBUG, INFO, WARN, ERROR, ALL 和 OFF，还有一个特俗值INHERITED或者同义词NULL，代表强制执行上级的级别。如果未设置此属性，那么当前loger将会继承上级的级别。
	- addtivity:是否向上级loger传递打印信息。默认是true。
loger可以包含零个或多个appender-ref元素，标识这个appender将会添加到该loger，或者说该logger供其他appender引用。

- **根节点的子节点root**:
　　它也是loger元素，但是它是根loger,其他logger都继承它。只有一个level属性定义日志级别。它已经被命名为"root"。其下可以包含零个或多个appender-ref元素，标识这个appender将会添加到这个loger，之后被appender元素引用。

- **根节点的子节点appender**:
　　 该元素中定义日志日志的输入位置，输出样式，过滤条件等等。其中包括设置输出到控制台，或者每天保存一个日志文件，或者每天将日志文件压缩等等。它对应的appender的class都继承于类ch.qos.logback.core.OutputStreamAppender。该类的具体继承关系树形图如下：
![logback](/assets/yoting/post/commonUtils/04.jpg)

　　
<h3>三、appender详细说明</h3>
　　appender有两个必要属性name和class。**name**指定appender名称，**class**指定appender的全限定名。appender常用的class有三个，**ch.qos.logback.core.ConsoleAppender**：输出到控制台（有target和encoder子节点），**ch.qos.logback.core.FileAppender**或**ch.qos.logback.core.rolling.RollingFileAppender**：输出到文件或者滚动记录到文件（有file、prudent、encoder、append、rollingPolicy、triggeringPolicy等子节点）。具体节点意义如下：

- **target**子节点：输入位置，字符串类型， System.out 或者 System.err ，默认 System.out。
- **file**子节点：被写入的文件名，可以是相对目录，也可以是绝对目录，如果上级目录不存在会自动创建，没有默认值。
- **append**：如果是 true，日志被追加到文件结尾，如果是 false，清空现存文件，默认是true。
- **prudent**子节点：如果是 true，日志会被安全的写入文件，即使其他的FileAppender也在向此文件做写入操作，效率低，默认是 false。
- **filter**子节点：日志输出过滤器，可设置输入日志级别等。
- **rollingPolicy**子节点：当发生滚动时，决定 RollingFileAppender 的行为，涉及文件移动和重命名。
- **triggeringPolicy**子节点： 告知 RollingFileAppender 何时激活滚动。
- **encoder**子节点：
　　encoder负责两件事，一是把日志信息转换成字节数组，二是把字节数组写入到输出流。目前PatternLayoutEncoder 是唯一有用的且默认的encoder ，它有一个<pattern>节点，用来设置日志的输入格式。使用“%”加“转换符”方式，如果要输出“%”，则必须用“\”对“\%”进行转义。
	- pattern节点是对日志输出格式进行控制，pattern的转换符号如下：（注意需要使用%加转换符的方式）
		- F / file	       输出执行记录请求的java源文件名。尽量避免使用，除非执行速度不造成任何问题。
		- L / line	       输出执行日志请求的行号。尽量避免使用，除非执行速度不造成任何问题。
		- m / msg / message	输出应用程序提供的信息。
		- M / method	输出执行日志请求的方法名。尽量避免使用，除非执行速度不造成任何问题。
		- n	              输出平台相关的换行符，比如“\n”或者“\r\n”。
		- p / le / level	输出日志级别。
		- r / relative	输出从程序启动到创建日志记录的时间，单位是毫秒
		- t / thread	输出产生日志的线程名。
		- contextName /cn 	输出上下文名称。
		- caller{depth}/caller{depth, evaluator-1, ... evaluator-n}	输出生成日志的调用者的位置信息，整数选项表示输出信息深度。
		- replace(p ){r, t}	p 为日志内容，r 是正则表达式，将p 中符合r 的内容替换为t 。
		- c {length } / lo {length } / logger {length } 	输出日志的logger名，可有一个整形参数，功能是缩短logger名，设置为0表示只输入logger最右边点符号之后的字符串。
		- C {length } / class {length } 	输出执行记录请求的调用者的全限定名。参数与上面的一样。尽量避免使用，除非执行速度不造成任何问题。
		- d {pattern } / date {pattern } 	输出日志的打印日志，模式语法与java.text.SimpleDateFormat 兼容。
		- 格式修饰符，与转换符共同使用：
　　可选的格式修饰符位于“%”和转换符之间。第一个可选修饰符是左对齐 标志，符号是减号“-”；接着是可选的最小宽度 修饰符，用十进制数表示。如果字符小于最小宽度，则左填充或右填充，默认是左填充（即右对齐），填充符为空格。如果字符大于最小宽度，字符永远不会被截断。最大宽度 修饰符，符号是点号"."后面加十进制数。如果字符大于最大宽度，则从前面截断。点符号“.”后面加减号“-”在加数字，表示从尾部截断。

**pattern格式控制举例说明：**

```xml
举例caller：
 %caller{2}   输出为：
0    [main] DEBUG - logging statement
Caller+0   at mainPackage.sub.sample.Bar.sampleMethodName(Bar.java:22)
Caller+1   at mainPackage.sub.sample.Bar.createLoggingRequest(Bar.java:17)
 %caller{3}   输出为：
16   [main] DEBUG - logging statement
Caller+0   at mainPackage.sub.sample.Bar.sampleMethodName(Bar.java:22)
Caller+1   at mainPackage.sub.sample.Bar.createLoggingRequest(Bar.java:17)
Caller+2   at mainPackage.ConfigTester.main(ConfigTester.java:38)

举例replace：
 "%replace(%msg){'\s', ''}"

举例logger：
%logger	mainPackage.sub.sample.Bar	mainPackage.sub.sample.Bar
%logger{0}	mainPackage.sub.sample.Bar	Bar
%logger{5}	mainPackage.sub.sample.Bar	m.s.s.Bar
%logger{10}	mainPackage.sub.sample.Bar	m.s.s.Bar
%logger{15}	mainPackage.sub.sample.Bar	m.s.sample.Bar
%logger{16}	mainPackage.sub.sample.Bar	m.sub.sample.Bar
%logger{26}	mainPackage.sub.sample.Bar	mainPackage.sub.sample.Bar

举例date：
%d	2006-10-20 14:06:49,812
%date	2006-10-20 14:06:49,812
%date{ISO8601}	2006-10-20 14:06:49,812
%date{HH:mm:ss.SSS}	14:06:49.812
%date{dd MMM yyyy ;HH:mm:ss.SSS}	20 oct. 2006;14:06:49.812

举例格式修饰符：
%-4relative 表示，将输出从程序启动到创建日志记录的时间 进行左对齐 且最小宽度为4。​
```

　　​至此，终于说完了lofback的一些基本使用方法，其实logback还很强大，如果需要，可以查看官方文档。
