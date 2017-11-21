---
layout: post
title: ThreadLocal的使用介绍
date: 2016-01-01 20
categories: Java
tags: java多线程 ThreadLocal
---
　　在多线程下执行某个任务或者方法的时候，我们可能需要让某些变量或者对象的属性在每个线程中相对独立，互不影响。如果我们只是简单的使用对象的属性来存储该变量，T1线程对其的操作势必会影响到T2线程对其的使用。怎么办呢？使用ThreadLocal解决线程之间参数传递以及线程之间参数隔离。

- **为何要使用ThreadLocal：**

　　假设我们有一个对象Var，可以被其他线程操作，对象中有个属性i，如下：

```java
public class Var
{
    int i = 0;
    //保证多线程下，i的值都能增加到
    public synchronized int increase()
    {
        this.i = i + 1;
        try
        {
	     //延长操作时间
            Thread.sleep(new Random().nextInt(2));
        } catch (InterruptedException e)
        {
            e.printStackTrace();
        }
        return this.i;
    }

    public int getValue()
    {
        return this.i;
    }
}
```

　　接下来我们通过多线程操作这个变量Var对象：

```java
public class Main
{
     //定义全局变量var对象
    static Var var = new Var();

    public static void main(String[] args)
    {
        Thread t1 = new Thread(new Runnable()
        {
	     //第一个线程对var执行增加100的操作
            @Override
            public void run()
            {
                for (int i = 0; i < 100; i++)
                {
                    var.increase();
                }
	         //增加完成后输出var对象的i的值
                System.out.println("var t1:" + var.getValue());
            }
        });
        t1.start();

        Thread t2 = new Thread(new Runnable()
        {
	      //第二个线程对var执行增加50的操作
            @Override
            public void run()
            {
                for (int i = 0; i < 50; i++)
                {
                    var.increase();
                }
                //增加完成输出var对象的值
                System.out.println("var t2:" + var.getValue());
            }
        });
        t2.start();

        //主线程输出var对象的值
        System.out.println("var main:" + var.getValue());
    }
}
```

*输出结果：（每次可能不同）*
var main:2 //因为主线程最先结束，在结束的时候，var的值只增加到2；
var t2:106 //接下来结束的线程是t2,但是在t2开始之前，t1已将var增加了若干次，同时在t2增加的过程中，也夹杂着t1的增加，所以t2的结果不是50而是大于50
var t1:150 //最后完成的是线程t1,因为t1线程对var增加了100，t2线程对var增加了50，所以结果总共增加了150

　　如果我们想让t1线程和t2线程独立，各自有各自的var属性，互相不影响，达到线程内部的隔离效果。那么我们通过上面的方式肯定不行的。java中提供ThreadLocal<T>供开发者使用，它提供了线程局部 (thread-local) 变量。这些变量不同于它们的普通对应物，因为访问某个变量（通过其 <tt>get</tt> 或 <tt>set</tt> 方法）的每个线程都有自己的局部变量，它独立于变量的初始化副本。<tt>ThreadLocal</tt> 实例通常是类中的 private static 字段，它们希望将状态与某一个线程（例如，用户 ID 或事务 ID）相关联。我们将上面代码改造：

```java
public class Main2
{
    //定义一个线程局部变量varLocal
    private static ThreadLocal<Var> varLocal = new ThreadLocal<Var>()
    {
         //对线程局部变量初始化，重写initialValue方法
        @Override
        protected Var initialValue()
        {
            return new Var();
        }

    };

    public static void main(String[] args)
    {

        Thread t1 = new Thread(new Runnable()
        {
            //第一个线程执行增加100的操作
            @Override
            public void run()
            {
                for (int i = 0; i < 100; i++)
                {
                    varLocal.get().increase();
                }
                //增加完成后输出变量的值
                System.out.println("varLocal t1:" + varLocal.get().getValue());
            }
        });
        t1.start();

        Thread t2 = new Thread(new Runnable()
        {
            //第一个线程执行增加50的操作
            @Override
            public void run()
            {
                for (int i = 0; i < 50; i++)
                {
                    varLocal.get().increase();
                }
                //增加完成后输出变量的值
                System.out.println("varLocal t2:" + varLocal.get().getValue());
            }
        });
        t2.start();

         //主线程输出变量的值
        System.out.println("varLocal main:" + varLocal.get().getValue());
    }
}
```

*输出结果：（每次都相同）*
varLocal main:0 //主线程最先执行完，但是主线程没有对变量操作，所以变量的值还是初始值
varLocal t2:50 //t2线程完成，t2线程只对变量增加了50，所以结果是50
varLocal t1:100 //t1线程最后执行完毕，t1线程对变量增加100，所以结果是100

- **ThreadLocal使用：**

　　最常见的ThreadLocal使用场景用来解决数据库连接、Session管理等。典型使用场景比如在hibernate中获取session的时候：

```java
private static final ThreadLocal threadSession = new ThreadLocal();

public static Session getSession() throws InfrastructureException {
    Session s = (Session) threadSession.get();
    try {
        if (s == null) {
            s = getSessionFactory().openSession();
            threadSession.set(s);
        }
    } catch (HibernateException ex) {
        throw new InfrastructureException(ex);
    }
    return s;
}
```

　　每当一个线程想要获取session的时候，首先通过threadSession获取，如果threadSession对象中能获取到session，那么就直接返回该session对象，如果通过threadSession不能获取到session对象，就通过sessionFactory创建一个session，同时将该新建的session放置到threadSession中，方便后面再次获取时直接返回。

- **ThreadLocal的基本操作：**
	- 构造器：ThreadLocal() 创建一个线程本地变量。
	- 初始化：initialValue()方法去设置本地变量对象的初始值，返回此线程局部变量的当前线程的“初始值”。
    protected T initialValue() {
        return null;
    }
线程第一次使用 get() 方法访问变量时将调用此方法，但如果线程之前调用了 set(T) 方法，则不会对该线程再调用 initialValue 方法。通常，此方法对每个线程最多调用一次，但如果在调用 get() 后又调用了 remove()，则可能再次调用此方法。该实现返回 null；如果程序员希望线程局部变量具有 null 以外的值，则必须为 ThreadLocal 创建子类，并重写此方法，因为该方法是producted的。通常将使用匿名内部类完成此操作，如上面定义varLocal对象那样。

	- 获取值：get()方法获取和线程相关的对象，返回此线程局部变量的当前线程副本中的值。
    public T get() {
        //do something
    }
如果变量没有用于当前线程的值，则先将其初始化为调用 initialValue() 方法返回的值。

	- 设置值：set()方法来设置线程局部变量的值。
    public void set(T value) {
        //do something
    }
大部分子类不需要重写此方法，它们只依靠 initialValue() 方法来设置线程局部变量的值。

	- 移除值：remove()方法将和线程相关的对象副本删除。
     public void remove() {
         //do something
     }
如果此线程局部变量随后被当前线程读取，且这期间当前线程没有设置其值，则将调用其 initialValue() 方法重新初始化其值。这将导致在当前线程多次调用 initialValue 方法。

　　至此，关于ThreadLocal的使用已经基本结束，用通俗的话来解释ThreadLocal就是：ThreadLocal的作用是提供线程内的局部变量，这种变量在线程的生命周期内起作用，减少同一个线程内多个函数或者组件之间一些公共变量的传递的复杂度。ThreadLocal是如何工作的，也可以简单的理解为：ThreadLocal维护一个全局的Map，Map的key是线程对象，value是要保存的对象，进入某个线程后，就可以从map中取得之前存储的相应线程关联的对象。当然，ThreadLocal并不是一个Map，但用Map来理解是没有问题的。ThreadLocal的实现原理之后在另一篇文章中分析源码说明。