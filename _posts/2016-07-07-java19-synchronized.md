---
layout: post
title: Java并发控制synchronized的使用
date: 2016-07-07
categories: Java
tags: java多线程
---
　　在多线程并发的情况下，我们可能需要让某个对象的某个方法被各个线程依次排队的执行，每个线程在执行的时候能不互相影响，而不是在某一时刻仍由其他线程来“捣乱”。这种情况我们最常用的方式就是将对象方法或代码块使用同步代修饰符synchronized保护起来，这样就达到我们期待的线程排队依次执行，等当前线程执行完以后，其他线程再进入方法或代码块执行。java中synchronized关键字可以保证同一时刻，只有一个线程可以执行某一个方法或者某一个代码块。那么synchronized到底怎么用呢，总的来说有5种用法，5种用法又分为两类，一类是对象锁，另一类是类锁。但是我认为类锁其实还是对象锁，为什么这样说，最后看完５种用法再解释。各种方式的具体用法如下：
　　对于第一类用法，通过给对象加锁的方式保证代码同步，有以下1、2、3三种方式。首先定一个服务对象类ServiceObj，该类对外提供serviceMethod方法，该类的具体代码如下：

```java
public class ServiceObj
{
    String objAttr = "a";
    public void serviceMethod(String tName) throws InterruptedException
    {
        //根据不同的情况，在此选择执行不同的方法
    }
    public void serviceMethod0(String tName) throws InterruptedException
    {
        System.out.println(tName + " begin time=" + System.currentTimeMillis());
        Thread.sleep(2000);
        System.out.println(tName + " end   time=" + System.currentTimeMillis());
    }
    public synchronized void serviceMethod1(String tName)
            throws InterruptedException
    {
        System.out.println(tName + " begin time=" + System.currentTimeMillis());
        Thread.sleep(2000);
        System.out.println(tName + " end   time=" + System.currentTimeMillis());
    }
    public void serviceMethod2(String tName) throws InterruptedException
    {
        synchronized (this)
        {
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
    public void serviceMethod3(String tName) throws InterruptedException
    {
        synchronized (objAttr)
        {
            // objAttr = "b";
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
    public void serviceMethod3_A(String tName) throws InterruptedException
    {
        synchronized ("a")
        {
            // objAttr = "b";
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
    public void serviceMethod3_B(String tName) throws InterruptedException
    {
        synchronized ("a")
        {
            // objAttr = "b";
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
}  
```

　　然后定义两个线程，两个线程分别执行ServiceObj的serviceMethod方法，具体代码如下：
第一个线程：

```java
public class MyThreadA extends Thread
{
    private ServiceObj obj;
    public MyThreadA(ServiceObj obj)
    {
        super();
        this.obj = obj;
    }
    @Override
    public void run()
    {
        try
        {
            obj.serviceMethod(this.getName());
        } catch (InterruptedException e)
        {
            e.printStackTrace();
        }
    }
}
```
第二个线程：

```java
public class MyThreadB extends Thread
{
    private ServiceObj obj;
    public MyThreadB(ServiceObj obj)
    {
        super();
        this.obj = obj;
    }
    @Override
    public void run()
    {
        try
        {
            obj.serviceMethod(this.getName());
        } catch (InterruptedException e)
        {
            e.printStackTrace();
        }
    }
}
```
　　最后在主线程中启动后面两个线程，具体代码如下：

```java
public class Main
{
    public static void main(String[] args)
    {
        ServiceObj obj = new ServiceObj();
        Thread t1 = new MyThreadA(obj);
        t1.setName("A");
        t1.start();
        Thread t2 = new MyThreadB(obj);
        t2.setName("B");
        t2.start();
    }
}  
```

　　在不加synchronized同步serviceMethod情况下，ServiceObj如下：

```java
public class ServiceObj
{
    String objAttr = "a";
    public void serviceMethod(String tName) throws InterruptedException
    {
        serviceMethod0(tName);
        // A begin time=1467720042503
        // B begin time=1467720042505
        // A end time=1467720044505
        // B end time=1467720044506
    }
    public void serviceMethod0(String tName) throws InterruptedException
    {
        System.out.println(tName + " begin time=" + System.currentTimeMillis());
        Thread.sleep(2000);
        System.out.println(tName + " end   time=" + System.currentTimeMillis());
    }

}  
```

　　通过运行结果明显看到线程A还没执行完毕，线程B就开始执行，也就是说线程B其实会有可能干扰线程A执行。在并发的情况下，这样是有问题的。所以我们需要通过synchronized让代码同步执行。

- **1、synchronized加在对象方法上**
将ServiceObj修改为：

```java
public class ServiceObj
{
    String objAttr = "a";
    public void serviceMethod(String tName) throws InterruptedException
    {
        serviceMethod1(tName);
        // A begin time=1467720082196
        // A end time=1467720084198
        // B begin time=1467720084198
        // B end time=1467720086198
    }

     //对整个方法同步
    public synchronized void serviceMethod1(String tName)
            throws InterruptedException
    {
        System.out.println(tName + " begin time=" + System.currentTimeMillis());
        Thread.sleep(2000);
        System.out.println(tName + " end   time=" + System.currentTimeMillis());
    }
}  
```

　　这是最常用的写法，直接在需要同步的方法上加上synchronized修饰符，通过结果看到A线程在彻底执行完毕以后，B线程才开始执行。

- **2、synchronized锁this对象代码块**
将ServiceObj修改为：

```java
public class ServiceObj
{
    String objAttr = "a";
    public void serviceMethod(String tName) throws InterruptedException
    {
        serviceMethod2(tName);
        // A begin time=1467720114630
        // A end time=1467720116631
        // B begin time=1467720116631
        // B end time=1467720118632
    }
          
     //同步对象本生this，使用synchronized包裹同步代码块
    public void serviceMethod2(String tName) throws InterruptedException
    {
        synchronized (this)
        {
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
}  
```

　　通过所以synchronized将需要同步的代码块包裹起来，同时对this对象加锁。通过结果看到A线程在彻底执行完毕以后，B线程才开始执行。

- **3、synchronized锁对象属性或某个具体对象**
将ServiceObj修改为：

```java
public class ServiceObj
{
    String objAttr = "a";
    public void serviceMethod(String tName) throws InterruptedException
    {
        serviceMethod3(tName);
        // A begin time=1467721417579
        // A end time=1467721419581
        // B begin time=1467721419581
        // B end time=1467721421581
    }

     //给对象的属性加锁同步代码块
    public void serviceMethod3(String tName) throws InterruptedException
    {
        synchronized (objAttr)
        {
            // objAttr = "b";//如果某个线程在线程执行过程中将锁对象修改，那么其他等待原来的对象释放锁的线程就可以立即执行，这样就不能保证代码同步执行。
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
} 
```

　　通过synchronized给对象的属性加锁，然后包裹同步代码块。这样相当于把锁加在objAttr这个对象上，通过结果也看以看到两个线程是依次执行的，没有互相捣乱。如果把把这种给对象的属性加锁修改为给一个非对象的属性对象加锁，那么会是怎么样的呢？将ServiceObj代码修改为如下：

```java
public class ServiceObj
{
    String objAttr = "a";
    public void serviceMethod(String tName) throws InterruptedException
    {
        //让A线程执行A方法，B线程执行B方法
        if (tName.endsWith("A"))
        {
            serviceMethod3_A(tName);
        } else
        {
            serviceMethod3_B(tName);
        }  
        // A begin time=1467721417579
        // A end time=1467721419581
        // B begin time=1467721419581
        // B end time=1467721421581
    }

     //给字符串对象“a”加锁同步代码块
    public void serviceMethod3_A(String tName) throws InterruptedException
    {
        synchronized ("a")
        {
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
     //同样也给字符串对象“a”加锁同步代码块
    public void serviceMethod3_B(String tName) throws InterruptedException
    {
        synchronized ("a")
        {
            System.out.println(tName + " begin time="
                    + System.currentTimeMillis());
            Thread.sleep(2000);
            System.out.println(tName + " end   time="
                    + System.currentTimeMillis());
        }
    }
} 
```

　　通过上面的运行结果可以知道这样两个线程的执行也是同步的，但是如果一个线程对“a”字符串对象加锁，另一个线程对“b”字符串加锁，那么这两个线程是非互斥的，他们会各自执行。
　　通过上面三种方式，在并发的时候对代码能够同步执行，其实主要就是利用锁机制，可以简单理解为当一个线程在获取了某个对象的锁的时候，其他线程都只有等待该线程释放该对象的锁以后才能够执行。

　　下面两种情况是给类加锁，首先修改ServiceObj类为：

```java
public class ServiceObj
{
    public void serviceMethod(String tName) throws InterruptedException
    {
        //根据不同的情况，在此选择执行不同的方法
    }
    public static void printA0() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printA");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printA");
    }
    public static void printB0() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printB");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printB");
    }
    public synchronized static void printA1() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printA");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printA");
    }
    public synchronized static void printB1() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printB");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printB");
    }
    public synchronized void printB1_() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printB");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printB");
    }
    public static void printA2() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printA");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printA");
        }
    }
    public static void printB2() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printB");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printB");
        }
    }
    public void printB2_() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printB");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printB");
        }
    }
}
```

　　然后依然使用上面的两个线程MyThreadA和MyThreadB,最后在主线程中启动两个线程。如果不加同步标签，将ServiceObj对象的serviceMethod修改为如下：

```java
public class ServiceObj
{
    public void serviceMethod(String tName) throws InterruptedException
    {
        // 不异步阻塞，结果未序列化执行
        if (tName.endsWith("A"))
        {
            printA0();
        } else
        {
            printB0();
        }  
        // 线程名称为：A在1467722664737进入printA
        // 线程名称为：B在1467722664737进入printB
        // 线程名称为：B在1467722665739离开printB
        // 线程名称为：A在1467722665739离开printA
    }
    public static void printA0() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printA");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printA");
    }
    public static void printB0() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printB");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printB");
    }
}  
```

- **4、synchronized加在类的静态方法上**
修改ServiceObj对象：

```java
public class ServiceObj
{
    public void serviceMethod(String tName) throws InterruptedException
    {
        // synchronized static方法，相当于对整个类加锁，这种情况两个线程是互斥的
        if (tName.endsWith("A"))
        {
            printA1();
        } else
        {
            printB1();
        }  
        // 线程名称为：A在1467722723867进入printA
        // 线程名称为：A在1467722724868离开printA
        // 线程名称为：B在1467722724868进入printB
        // 线程名称为：B在1467722725869离开printB
    }
  
    public synchronized static void printA1() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printA");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printA");
    }
    public synchronized static void printB1() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printB");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printB");
    }
}  
```

　　上面两个线程分别执行ServiceObj的两个不同的static方法，结果是代码同步执行，说明是对整个类加锁，所以导致整个类的所有synchronized修饰的static方法都是同步执行。但是如果我么synchronized锁一个static方法，另个一线程锁非static方法，那么结果会怎么样呢？修改代码如下：

```java
public class ServiceObj
{
    public void serviceMethod(String tName) throws InterruptedException
    {
        // synchronized static方法，相当于对整个类加锁，这种情况两个线程是互斥的
        if (tName.endsWith("A"))
        {
            printA1();
        } else
        {
            printB1_();
        }  
        // 线程名称为：B在1467723253951进入printB
        // 线程名称为：A在1467723253951进入printA
        // 线程名称为：B在1467723254954离开printB
        // 线程名称为：A在1467723254955离开printA  
    }
  
    public synchronized static void printA1() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printA");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printA");
    }
    public synchronized void printB1_() throws InterruptedException
    {
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "进入printB");
        Thread.sleep(1000L);
        System.out.println("线程名称为：" + Thread.currentThread().getName() + "在"
                + System.currentTimeMillis() + "离开printB");
    }
}  
```
　　结果和明显，两个线程的代码并没有同步执行。因为两个线程锁的对象不同，static方法锁的是整个类对象，而非static方法锁的是类产生的对象，不是类对象。所以两个线程的代码是不能同步的。

- **5、synchronized锁Class对象**
修改ServcieObj对象：

```java
public class ServiceObj
{
    public void serviceMethod(String tName) throws InterruptedException
    {
        
        // 第二种方式：synchronized类Xxx.class，相当于synchronized代码块，这种情况两个线程是互斥的
        if (tName.endsWith("A"))
        {
            printA2();
        } else
        {
            printB2();
        }  
        // 线程名称为：A在1467722766999进入printA
        // 线程名称为：A在1467722768002离开printA
        // 线程名称为：B在1467722768002进入printB
        // 线程名称为：B在1467722769003离开printB

    }
   
    public static void printA2() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printA");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printA");
        }
    }
    public static void printB2() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printB");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printB");
        }
    }
} 
```

　　这种对都是static的方法使用类锁，代码是同步执行的。那么如果对一个static方法，另个非static方法使用类锁，结果是否也是同步的呢？修改ServcieObj对象：

```java
public class ServiceObj
{
    public void serviceMethod(String tName) throws InterruptedException
    {
        if (tName.endsWith("A"))
        {
            printA2();
        } else
        {
            printB2_();
        }  
        // 线程名称为：A在1467722766999进入printA
        // 线程名称为：A在1467722768002离开printA
        // 线程名称为：B在1467722768002进入printB
        // 线程名称为：B在1467722769003离开printB

    }
   
    public static void printA2() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printA");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printA");
        }
    }
    public void printB2_() throws InterruptedException
    {
        synchronized (ServiceObj.class)
        {
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "进入printB");
            Thread.sleep(1000L);
            System.out.println("线程名称为：" + Thread.currentThread().getName()
                    + "在" + System.currentTimeMillis() + "离开printB");
        }
    }
}  
```

　　通过结果观察，这中方式也是同步的。因为两个线程都锁的是类对象，也就是说锁的同一个对象，所以他们之间是同步执行的。
　　最后，我觉得其实并没有类锁这个东西，synchronized所得都是某一个对象，前三种1、2、3的方式都是锁的是类锁产生的对象或者类的属性对象或者某一个具体的对象（比如字符串"a"对象），所以两个线程之间能够互斥同步执行。第4、5两种方式，归根到底也是给某个对象加锁，都可一等价类比于第三种的给字符串“a”加锁，因为Xxx.class也是一个对象。