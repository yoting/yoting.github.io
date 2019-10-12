---
layout: post
title: Tensorflow基础和用法
date: 2019-05-01
categories: AI
tags: tensorflow
---





### 快速上手

```java
public class QuartzSimpleDemo {
	public static void main(String[] args) throws SchedulerException {
		Scheduler scheduler = StdSchedulerFactory.getDefaultScheduler();

		JobDetail jobDetail = new JobDetailImpl("jname", "group", SayHelloJob.class);
		Trigger trigger = new SimpleTriggerImpl("tname", "group", new Date(2018, 9, 1),new Date(2018, 10, 1), 10, 1);
		
		scheduler.scheduleJob(jobDetail, trigger);
		scheduler.start();
		scheduler.shutdown();
	}
}

public class SayHelloJob implements Job {
	@Override
	public void execute(JobExecutionContext jobExecutionContext) throws JobExecutionException {
		System.out.println("hello-" + Thread.currentThread().getName());
	}
}
```

上面代码主要关键点：

- 定义一个Schedule调度器对象，该对象可以通过工厂获取默认配置的Schedule
- 定义一个JobDetail任务详情对象，该对象描述了某个任务需要做的事情。其中需要做的事情在SayHelloJob这个类中定义，同时需要给这个jobdetail一个唯一标识，通过name 和group来标识。
- 定义一个Trigger触发器对象，该对象描述了某个任务需要在什么时间节点上开始触发执行。同样需要给这个trigger一个唯一标识，也是通过name和group来标识。
- 将任务详情和和触发器绑定，就可以约定好在某个时间执行某件事情。最后还要启动schedule。



### 调度器获取

​	上面采用的是获取默认的调度器，设置了quartz的一些属性，实例名称、比如线程池、任务持久化等的默认值。我们也可以自己定制调度器，通过给SchedulerFactory配置初始化加载的配置文件，比如下面的代码：

```java
SchedulerFactory factory = new StdSchedulerFactory("quartz.properties");
Scheduler scheduler = factory.getScheduler();
```

​	当然除了通过配置文件，还可以是Properties等形式去配置，对于quartz.properties文件，我可比较常用的配置如下：

```xml
#配置基本信息，比如实例名称等
org.quartz.scheduler.instanceName = DefaultQuartzScheduler
org.quartz.scheduler.instanceId = AUTO
org.quartz.scheduler.rmi.export = false
org.quartz.scheduler.rmi.proxy = false
org.quartz.scheduler.wrapJobExecutionInUserTransaction = false

#配置任务执行线程池信息
org.quartz.threadPool.class = org.quartz.simpl.SimpleThreadPool
org.quartz.threadPool.threadCount = 3
org.quartz.threadPool.threadPriority = 5
org.quartz.threadPool.threadsInheritContextClassLoaderOfInitializingThread = true

#配置任务持久化相关信息
org.quartz.jobStore.misfireThreshold = 60000
org.quartz.jobStore.class = org.quartz.simpl.RAMJobStore
```



### Job和JobDetail以及JobDataMap

- Job接口是某个任务具体的执行者，我们只需要自己实现该接口即可

- JobDetail是任务的详情信息，其中含有一个Job接口对象的引用

- Quartz调度一次任务，会干如下的事：

  > JobClass jobClass=JobDetail.getJobClass()
  >
  > Job jobInstance=jobClass.newInstance()
  >
  > jobInstance.execute(JobExecutionContext context)


​	JobExecutionContext是Job运行的上下文，可以获得Trigger、Scheduler、JobDetail的信息。也就是说，每次调度都会创建一个新的Job实例，这样的好处是有些任务并发执行的时候，不存在对临界资源的访问问题。


​	Job都次都是newInstance的实例，那我怎么传值给它？ 实现的办法是通过JobDataMap。 每一个JobDetail都会有一个JobDataMap。JobDataMap本质就是一个Map的扩展类，只是提供了一些更便捷的方法，比如getString()之类的。对于同一个JobDetail实例，执行的多个Job实例，是共享同样的JobDataMap，也就是说，如果你在任务里修改了里面的值，会对其他Job实例（并发的或者后续的）造成影响。

​	除了JobDetail，Trigger同样有一个JobDataMap，共享范围是所有使用这个Trigger的Job实例。

​	上面的例子通过new JobDetailImpl()对象来构建任务，但是现在更提倡使用JobBuilder去构建JobDetail，具体示例代码如下：

```java
JobDetail j1 = JobBuilder.newJob().ofType(SayHelloJob.class)
  .withIdentity("name1","group").build();
j1.getJobDataMap().put("key", "value");
```



### Trigger

​	所有Trigger都会包含这两个属性 **startTime**和**endTime**，指定的Trigger会被触发的时间区间。在这个区间之外，Trigger是不会被触发的。

​	Trigger的定义除了上面用的直接new SimpleTriggerImpl()对象外，我们现在更推荐使用以下方式：

```java
Trigger trigger = TriggerBuilder.newTrigger().withIdentity("tname", "group").withSchedule(/*具体的ScheduleBuilder类型*/).startAt(new Date()).endAt(new Date()).build();
```

触发器接口主要的实现类包含下面几种：

- **SimpleTrigger** 对应的schedule：SimpleScheduleBuilder


>指定从某一个时间开始，以一定的时间间隔（单位是毫秒）执行的任务。
>
>它适合的任务类似于：9:00 开始，每隔1小时，执行一次。
>
>它的属性有：
>
>- repeatInterval 重复间隔
>- repeatCount 重复次数。实际执行次数是 repeatCount+1。因为在startTime的时候一定会执行一次。

```java
//每小时执行一次，重复5次（共执行6次）
SimpleScheduleBuilder.simpleSchedule().withIntervalInHours(1).withRepeatCount(5);
```

- **CalendarIntervalTrigger** 对应的schedule：CalendarIntervalScheduleBuilder


>类似于SimpleTrigger，指定从某一个时间开始，以一定的时间间隔执行的任务。 但是不同的是SimpleTrigger指定的时间间隔为**毫秒**，没办法指定每隔一个月执行一次（每月的时间间隔不是固定值），而CalendarIntervalTrigger支持的间隔单位有**秒，分钟，小时，天，月，年，星期**。
>
>相较于SimpleTrigger有两个优势：1、更方便，比如每隔1小时执行，你不用自己去计算1小时等于多少毫秒。 2、支持不是固定长度的间隔，比如间隔为月和年。但劣势是精度只能到秒。
>
>它适合的任务类似于：9:00 开始执行，并且以后每周 9:00 执行一次
>
>它的属性有:
>
>- interval 执行间隔
>- intervalUnit 执行间隔的单位（秒，分钟，小时，天，月，年，星期）

```java
//每间隔2周执行一次
CalendarIntervalScheduleBuilder.calendarIntervalSchedule().withIntervalInWeeks(2);
		CalendarIntervalScheduleBuilder.calendarIntervalSchedule().withInterval(2, DateBuilder.IntervalUnit.WEEK);
```

- **DailyTimeIntervalTrigger** 对应的schedule：DailyTimeIntervalScheduleBuilder


>指定每天的某个时间段内，以一定的时间间隔执行任务。并且它可以支持指定星期。
>
>它适合的任务类似于：指定每天9:00 至 18:00 ，每隔70秒执行一次，并且只要周一至周五执行。
>
>它的属性有:
>
>- startTimeOfDay 每天开始时间
>- endTimeOfDay 每天结束时间
>- daysOfWeek 需要执行的星期
>- interval 执行间隔
>- intervalUnit 执行间隔的单位（秒，分钟，小时，天，月，年，星期）
>- repeatCount 重复次数

```java
DailyTimeIntervalScheduleBuilder.dailyTimeIntervalSchedule()
  .startingDailyAt(TimeOfDay.hourAndMinuteOfDay(9, 0)) //第天9：00开始
  .endingDailyAt(TimeOfDay.hourAndMinuteOfDay(16, 0)) //16：00 结束
  .onDaysOfTheWeek(MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY) //周一至周五执行
  .withIntervalInHours(1) //每间隔1小时执行一次
  .withRepeatCount(100); //最多重复100次（实际执行100+1次）
```

- **CronTrigger** 对应的schedule：CronScheduleBuilder


> 适合于更复杂的任务，它支持类型于Linux Cron的语法（并且更强大）。基本上它覆盖了以上三个Trigger的绝大部分能力
>
> 它适合的任务类似于：每天0:00,9:00,18:00各执行一次。
>
> 它的属性只有:
>
> - Cron表达式。但这个表示式本身就够复杂了。下面会有说明。

```java
//每天九点执行一次
CronScheduleBuilder.cronSchedule("0 0 9 * * * ?");
```

### 任务持久化

​	默认配置的定时任务存储在内存中，当系统宕机或者重启后，之前的任务就不复存在。除了让任务持久化到内存中，我们还可以配置任务保存在数据库中，当系统重启后会恢复所有的定时任务，具体做法是先在配置文件配置数据库数据源配置等。

```xml
#默认暂存到内存中
#org.quartz.jobStore.class = org.quartz.simpl.RAMJobStore

#配置持久化到数据库中
org.quartz.jobStore.class = org.quartz.impl.jdbcjobstore.JobStoreTX
org.quartz.jobStore.driverDelegateClass = org.quartz.impl.jdbcjobstore.StdJDBCDelegate
org.quartz.jobStore.tablePrefix = QRTZ_
org.quartz.jobStore.dataSource = MyDS

#数据源MyDS相关配置（数据库配置）
org.quartz.dataSource.MyDS.driver = com.mysql.jdbc.Driver
org.quartz.dataSource.MyDS.URL = jdbc:mysql://localhost:3306/quartz?characterEncoding=utf-8
org.quartz.dataSource.MyDS.user = root
org.quartz.dataSource.MyDS.password = root
org.quartz.dataSource.MyDS.maxConnections = 5
```

初始化数据库表：所有表名都以QRTZ_开头

```sql
DROP TABLE IF EXISTS QRTZ_FIRED_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_PAUSED_TRIGGER_GRPS;
DROP TABLE IF EXISTS QRTZ_SCHEDULER_STATE;
DROP TABLE IF EXISTS QRTZ_LOCKS;
DROP TABLE IF EXISTS QRTZ_SIMPLE_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_SIMPROP_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_CRON_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_BLOB_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_TRIGGERS;
DROP TABLE IF EXISTS QRTZ_JOB_DETAILS;
DROP TABLE IF EXISTS QRTZ_CALENDARS;

#创建对应的表，具体sql可以从官方文档拷贝
CREATE TABLE QRTZ_*
commit;
```

​	ScheduleFactory获取到调度器后，会自动加载数据源对应的定时任务。新添加和删除job的同时，会将数据库中的对应的记录删除调。