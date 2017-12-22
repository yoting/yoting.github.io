---
layout: post
title: Java获取线程执行结果
date: 2016-06-09
categories: Java
tags: java多线程
---
&ensp;&ensp;&ensp;&ensp;在使用多线程执行某些任务的时候，我们通常会使用Runnable接口或者Thread类完成。但是这两种方式都没法获取线程执行结束以后返回的结果，如果我们要获取某个线程执行完成以后返回的结果，java中给我们提供了Callable和Future以及FutureTask可以达到获取线程执行结果的方式。

### 相关接口概念

&ensp;&ensp;&ensp;&ensp;首先了解几个基础接口和类：

- **Executors 类**：此包中所定义的 Executor、ExecutorService、ScheduledExecutorService、ThreadFactory 和 Callable 类的工厂和实用方法。其实就是一个便捷工厂，提供一些便捷方法，比如创建线程池，创建线程，创建Callable接口对象等等
- **Executor接口**：只包含一个execute（）接口方法。主要是用来执行线程任务。
- **ExecutorService接口**：继承Executor接口，额外有submint（）方法，以及shutdown()方法等等。submit方法是提交线程任务，同时使用Future接收返回结果。
- **ScheduledExecutorService接口**：继承ExecutorService接口，额外有schedule（）方法，可安排在给定的延迟后运行或定期执行的命令。

关于上面几个类和接口的UML关系图如下：
![javaThreadPool](/assets/yoting/post/java/javaThreadPool.jpg)

### 使用示例

- **Callable接口的使用：**

　　Callable接口和Runnable接口很相似，都能够提供一个独立的线程然后去帮我们完成我们需要完成的任务。两种接口的基本用法如下：

```java
ExecutorService executor = Executors.newCachedThreadPool();
executor.execute(new Runnable()
{
    @Override
    public void run()
    {
        System.out.println("a");
    }
});

Future<?> future1 = executor.submit(new Runnable()
{
    @Override
    public void run()
    {
        System.out.println("b");
    }
});
Future<Long> future2 = executor.submit(new Runnable()
{
    @Override
    public void run()
    {
        System.out.println("c");
    }
}, System.currentTimeMillis());
Future<Long> future3 = executor.submit(new Callable<Long>()
{
    @Override
    public Long call() throws Exception
    {
        System.out.println("d");
        return System.currentTimeMillis();
    }
});
//注意使用shutdown关闭线程
executor.shutdown();  
```

　　通过上面的例子，可以知道要想获取线程执行结果，必须使用Callable开启子线程，同时使用Future对象接收。对于上面的几个future，只有future3是真正的接收了线程执行完成返回的结果，可以根据线程内的代码执行情况，动态返回运算结果。future2只是能接收到线程执行完成返回特定的结果，不能根据线程内的执行情况返回相关的结果。future1只能知道线程是否执行完毕。

- **Future的使用：**

　　Future 表示异步计算的结果。它提供了检查计算是否完成的方法，以等待计算的完成，并获取计算的结果。计算完成后只能使用 get 方法来获取结果，如有必要，计算完成前可以阻塞此方法。取消则由 cancel 方法来执行。还提供了其他方法，以确定任务是正常完成还是被取消了。一旦计算完成，就不能再取消计算。如果为了可取消性而使用 Future 但又不提供可用的结果，则可以声明 Future<?> 形式类型、并返回 null 作为底层任务的结果。使用Future对象接收到线程返回对象，那么如何使用这个结果呢？实例如下：

```java
public class Main
{
    public static void main(String[] args)
    {
        Future<Long> future = null;
        ExecutorService executor = Executors.newCachedThreadPool();
        future = executor.submit(new Callable<Long>()
        {
            @Override
            public Long call() throws Exception
            {
                System.out.println(" future doing ...");
                return System.currentTimeMillis();
            }
        });
        executor.shutdown();
        // isDown()判断线程是否执行完毕，如果执行完毕，返回true，反之
        // get()获取返回结果对象
        // cancel(false)中断任务，boolean表示是否强制中断
        Long result = null;
        if (!future.isDone())// 非阻塞式获取结果，不能保证结果一定能拿到
        {
            try
            {
                // 获取future的结果对象,如果还没完成，愿意等待一定的时间
                result = future.get(1000L, TimeUnit.MILLISECONDS);
                System.out.println(result);
            } catch (InterruptedException e)
            {
                e.printStackTrace();
            } catch (ExecutionException e)
            {
                e.printStackTrace();
            } catch (TimeoutException e)
            {
                e.printStackTrace();
            }
        } else
        {
            try
            {
                // 如果已经完成，直接获取结果
                future.get();
            } catch (InterruptedException e)
            {
                e.printStackTrace();
            } catch (ExecutionException e)
            {
                e.printStackTrace();
            }
        }
        while (!future.isDone())// 阻塞式获取结果
        {
            try
            {
                // 获取future的结果对象
                result = future.get();
                System.out.println(result);
            } catch (InterruptedException e)
            {
                e.printStackTrace();
            } catch (ExecutionException e)
            {
                e.printStackTrace();
            }
        }
        boolean cancel = future.cancel(true);
        boolean isCancel = future.isCancelled();
        System.out.println(cancel + "," + isCancel);//false,false
    }
}
```

- **FutureTask的使用：**

　　FutureTask 类是 Future 的一个实现，所以包含所有Future的接口方法。FutureTask又是对 Callable 或 Runnable 对象包装。因为 FutureTask 实现了 Runnable，所以可将 FutureTask 提交给 Executor 执行。 上面的代码可以使用下面的代码替代：

```java
//构造一个FutureTask，包含一个callable接口的实现
FutureTask<Long> futureTask = new FutureTask<Long>(new Callable<Long>()
{
    @Override
    public Long call() throws Exception
    {
        System.out.println("future task doing ...");
        return System.currentTimeMillis();
    }
});
executor.submit(futureTask);
//可以使用所有的Future的接口方法
while (!futureTask.isDone())// 阻塞式获取结果
{
    try
    {
        // 获取future的结果对象
        result = futureTask.get();
        System.out.println(result);
    } catch (InterruptedException e)
    {
        e.printStackTrace();
    } catch (ExecutionException e)
    {
        e.printStackTrace();
    }
}
executor.shutdown();  
```

- **ScheduledFuture的使用：**

　　对于多线程中计划任务线程，可以使用同样的方式接收线程执行结果，实例如下：

```java
ScheduledExecutorService scheduledExecutor = Executors
        .newScheduledThreadPool(10);
ScheduledFuture<Long> scheduledFuture = scheduledExecutor.schedule(
        new Callable<Long>()
        {
            @Override
            public Long call() throws Exception
            {
                System.out.println("scheduled future doing ...");
                return System.currentTimeMillis();
            }
        }, 1000L, TimeUnit.MILLISECONDS);
while (!scheduledFuture.isDone())// 阻塞式获取结果
{
    try
    {
        // 获取future的结果对象
        result = scheduledFuture.get();
        System.out.println("scheduled future:" + result);
        } catch (InterruptedException e)
        {
            e.printStackTrace();
        } catch (ExecutionException e)
        {
            e.printStackTrace();
        }
    }
    scheduledExecutor.shutdown();
}  
```

　　从此获取多线程执行返回结果不再是难事啦。。。
