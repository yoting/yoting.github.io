---
layout: post
title: Java多线程等待和恢复
date: 2018-09-03
categories: Java
tags: thread
---

​     本文讲述多线程情况下的wait和notify的使用。首先看下Java关于这两类方法的api。

### JavaAPI

| 返回      | 方法                              | 方法描述                                     |
| ------- | ------------------------------- | ---------------------------------------- |
| ` void` | `notify()`                      | 唤醒在此对象监视器上等待的单个线程。                       |
| ` void` | `notifyAll()`                   | 唤醒在此对象监视器上等待的所有线程。                       |
| ` void` | `wait()`                        | 在其他线程调用此对象的 `notify()` 方法或`notifyAll()`方法前，导致当前线程等待。 |
| ` void` | `wait(long timeout)`            | 在其他线程调用此对象的`notify()`方法或`notifyAll()`方法，或者超过指定的时间量前，导致当前线程等待。 |
| ` void` | `wait(long timeout, int nanos)` | 在其他线程调用此对象的`notify()`方法或`notifyAll()`方法，或者其他某个线程中断当前线程，或者已超过某个实际时间量前，导致当前线程等待。 |

### 简单实例

```java
public class MyThread {
	public static void main(String[] args) {
		new Thread(new Runnable() {
			@Override
			public void run() {
                System.out.println("第一个线程开始...");
				synchronized (MyThread.class) {
					System.out.println(1);
					try {
						MyThread.class.wait();//让出CPU资源和锁，等待别的线程notify
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
					System.out.println(2);//获取到锁后继续执行
                  	try {
						MyThread.class.wait(5000);//等待别的线程notify或者等待5秒
					} catch (InterruptedException e) {
						e.printStackTrace();
					}
                    System.out.println(3);//获取到锁后继续执行
				}
			}
		}).start();

		new Thread(new Runnable() {
			@Override
			public void run() {
                System.out.println("第二个线程开始...");
                System.out.println(21);
                try {
                    TimeUnit.SECONDS.sleep(10);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                }
                synchronized (MyThread.class) {
					MyThread.class.notifyAll();//释放该class对象的上wait
				}
			}
		}).start();
	}
}
```

### 使用总结

1、wait()、notify/notifyAll() 方法是Object的本地final方法，无法被重写。

2、wait()使当前线程阻塞，前提是必须先获得锁，一般配合synchronized 关键字使用，即一般在synchronized 同步代码块里使用 wait()、notify/notifyAll() 方法。

3、 由于 wait()、notify/notifyAll() 在synchronized 代码块执行，说明当前线程一定是获取了锁的。

当线程执行wait()方法时候，会释放当前的锁，然后让出CPU，进入等待状态。

只有当 notify/notifyAll() 被执行时候，才会唤醒一个或多个正处于等待状态的线程，然后继续往下执行，直到执行完synchronized 代码块的代码或是中途遇到wait() ，再次释放锁。

也就是说，notify/notifyAll() 的执行只是唤醒沉睡的线程，而不会立即释放锁，锁的释放要看代码块的具体执行情况。所以在编程中，尽量在使用了notify/notifyAll() 后立即退出临界区，以唤醒其他线程 

4、wait() 需要被try-catch包围，中断也可以使wait等待的线程唤醒。

5、notify 和wait 的顺序不能错，如果A线程先执行notify方法，B线程再执行wait方法，那么B线程是无法被唤醒的。

6、notify 和 notifyAll的区别

> notify方法只唤醒一个等待（对象的）线程并使该线程开始执行。所以如果有多个线程等待一个对象，这个方法只会唤醒其中一个线程，选择哪个线程取决于操作系统对多线程管理的实现。notifyAll 会唤醒所有等待(对象的)线程，尽管哪一个线程将会第一个处理取决于操作系统的实现。如果当前情况下有多个线程需要被唤醒，推荐使用notifyAll 方法。比如在生产者-消费者里面的使用，每次都需要唤醒所有的消费者或是生产者，以判断程序是否可以继续往下执行。

7、在多线程中要测试某个条件的变化，使用if 还是while？

> 要注意，notify唤醒沉睡的线程后，线程会接着上次的执行继续往下执行。所以在进行条件判断时候，可以先把 wait 语句忽略不计来进行考虑，显然，要确保程序一定要执行，并且要保证程序直到满足一定的条件再执行，要使用while来执行，以确保条件满足和一定执行。这样在线程被唤醒后，会再次判断条件是否正真满足。

8、wait和Thread.sleep的区别

> wait会释放锁对象，sleep不会释放锁对象。wait是Object对象的方法，sleep是Thread类的方法。

### 生产者和消费者运用

我们有一个仓库，仓库的容量只能放10个东西。如果有生产者需要将N个东西放到仓库中，需要等待仓库有足够的容量，消费者从仓库中拿N个东西，需要等仓库中有足够的货物。基于这个模型我们来运用wait和notify实现。

定义仓库（物品池）：

```java
package com.gusi.demo;

import java.util.ArrayDeque;
import java.util.Deque;

/**
 * 仓库
 */
public class Stores {
    // 仓库定义为单例
	private static Stores instance = new Stores();

	private Stores() {

	}

	public static Stores getInstance() {
		return instance;
	}

	// 仓库容量
	public static final int MAX = 10;
	private Deque storeList = new ArrayDeque();

	/**
	 * 生产n个
	 * 
	 * @param num
	 */
	public void producter(int num) {

		synchronized (storeList) {
			System.out.println(
					Thread.currentThread().getName() + "生产:" + num + " 容量：" + (MAX - storeList.size()));
			while (num + storeList.size() > MAX) {
				try {
					System.out.println(Thread.currentThread().getName() + "-生产等待。。。");
					storeList.wait(); //容量不足，释放锁等待消费者
				} catch (InterruptedException e) {
					e.printStackTrace();
				}

			}
			//被notify并且容量足够后，开始生产
			System.out.println(Thread.currentThread().getName() + "-生产" + num + "个");
			for (int i = 0; i < num; i++) {
				String s = Thread.currentThread().getName() + "-" + i;
				System.out.println(s);
				storeList.offerLast(s);
			}

          	//生产完后通知所有的消费者
			storeList.notifyAll();
		}

	}

	/**
	 * 消费n个
	 * 
	 * @param num
	 */
	public void consumer(int num) {
		synchronized (storeList) {
			System.out.println(Thread.currentThread().getName() + "消费:" + num + " 余量：" + storeList.size());
			while (num > storeList.size()) {
				try {
					System.out.println(Thread.currentThread().getName() + "-消费等待。。。");
					storeList.wait();//余量不足，释放锁等待生产者
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
			}
          	//被notify或余礼足够后，开始消费
			System.out.println(Thread.currentThread().getName() + "-消费" + num + "个");
			for (int i = 0; i < num; i++) {
				System.out.println(storeList.pollFirst());
			}
			//消费完后通知生产者
			storeList.notifyAll();
		}
	}
}
```

通过多线程生产和消费：

```java
//生产者
class ProductThread extends Thread {
	int num = 0;

	public ProductThread(int num) {
		this.num = num;
	}

	@Override
	public void run() {
		Stores.getInstance().producter(num);
	}
}

//消费者
class ConsumerThread extends Thread {
	int num = 0;

	public ConsumerThread(int num) {
		this.num = num;
	}

	@Override
	public void run() {
		Stores.getInstance().consumer(num);
	}
}
```

