---
layout: post
title: 设计模式之观察者模式
date: 2016-07-31
categories: "Design_Pattern"
tags: design observer
---

&emsp;&emsp;将一个系统分割成一系列相互协作的类有一个不好的副作用，那就是需要维护相关对象间的一致性。我们不希望为了维持一致性而使各类紧密耦合，这样会给维护、扩展和重用都带来不便。观察者模式就是解决这类的耦合关系的。观察者模式定义了一种一对多的依赖关系，让多个观察者对象同时监听某一个主题对象。这个主题对象在状态发生变化时，会通知所有观察者对象，使它们能够自动更新自己。
&emsp;&emsp;其中涉及到主要是两个角色：观察者和被观察者。JDK提供了观察者模式的相关接口和类，接下来通过使用JDK提供的接口和类，实现一个简单的观察者模式的样例。类和接口的结构图如下：
![此处输入图片的描述][1]

代码实现如下：
首先看一下Observable源码：

```java
//该源码只是截取了部分方法和片段
public class Observable {
    private boolean changed = false;//状态
    private Vector<Observer> obs;//正在观察自己的观察者列表

    public Observable() {
        obs = new Vector<>();
    }
    //添加观察者
    public synchronized void addObserver(Observer o) {
        if (o == null)
            throw new NullPointerException();
        if (!obs.contains(o)) {
            obs.addElement(o);
        }
    }
    //删除观察者
    public synchronized void deleteObserver(Observer o) {
        obs.removeElement(o);
    }
    //通知观察者，其实就是调运观察者的update方法
    public void notifyObservers(Object arg) {
        Object[] arrLocal;

        synchronized (this) {
            if (!changed)
                return;
            arrLocal = obs.toArray();
            clearChanged();
        }

        for (int i = arrLocal.length-1; i>=0; i--)
            ((Observer)arrLocal[i]).update(this, arg);
    }
    //修改状态
    protected synchronized void setChanged() {
        changed = true;
    }
}
```
定义一个被观察的对象MySubject：
```java
//Observable是JDK源码提供的类
public class MySubject extends Observable {
    //该类继承Observable是关键，表明该类是被观察者
	@Override
	public void notifyObservers(Object arg) {
		super.setChanged();
		//这里因为JDK的被观察者的对象有状态，需要先设置状态为true之后才能有效的发送通知，所以先在这里调运setChanged方法，这点可以看上面的源码，很清晰
		super.notifyObservers(arg);
		//源码中的notifyObservers方法就是依次调运观察者的update方法
	}
}
```

定义两个对Subject主题关注的观察者对象MyWatcher1和MyWatcher2：
```java
//Observer是JDK源码提供的接口

//MyWatcher1:
public class MyWatcher1 implements Observer {
	@Override
	public void update(Observable o, Object arg) {
		System.out.println(o.toString() + arg.toString() + " a ");
	}
}

//MyWatcher2:
public class MyWatcher2 implements Observer {
	@Override
	public void update(Observable o, Object arg) {
		System.out.println(o.toString() + arg.toString() + " b ");
	}
}
//上面两个观察者观察者的核心是实现Observer接口，该接口只有一个update方法，该方法就是用来被观察者通知观察者的
```

测试上面的代码：
```java
public class Main {

	public static void main(String[] args) {
		Observer a = new MyWatcher1();//定义两个观察者a和b
		Observer b = new MyWatcher2();

		MySubject subject = new MySubject();//定义一个被观察的主题subject
		subject.addObserver(a);//分别将两个观察者加到主题的观察队列
		subject.addObserver(b);

		subject.notifyObservers("subjcet notify");//主题主动通知观察者

		System.out.println("complete");
	}
}
```

运行结果如下：
```xml
subject notify a //这是MyWatcher1观察到的结果
subject notify b //这是MyWatcher2观察到的结果
complete
```

以上就是观察者模式，和观察者模式很相近的一种是监听模式，比如我们监听一个按钮的点击事件和鼠标移上去的事件，这在Swing编程中很常见。在分析监听器模式之前，我们需要先明确几个对象或者概念。

- 事件源：Button按钮就是事件源
- 事件对象：点击按钮和鼠标移上按钮分别是两个事件对象
- 事件监听器：点击按钮以后触发的行为操作就是监听器该处理的操作

整个模型对应的类图如下：
![此处输入图片的描述][2]

具体代码如下：
首先看一下源码事件对象基类EventObject：

```java
public class EventObject implements java.io.Serializable {
    protected transient Object  source;//事件源对象
    public EventObject(Object source) {//父类事件源对象构造器
        if (source == null)
            throw new IllegalArgumentException("null source");
        this.source = source;
    }
}
```

定义按钮两个事件对象：ButtonClickEvent、ButtonMouseonEvent，分别继承EventObject

```java
/**
 * 事件（按钮的点击事件）
 */
public class ButtonClickEvent extends EventObject {

	public ButtonClickEvent(Object source) {
		super(source);
	}

	public void click() {
		System.out.println(source.toString() + " click event happend");
	}
}

/**
 * 事件（按钮的鼠标事件）
 */
public class ButtonMouseonEvent extends EventObject {

	public ButtonMouseonEvent(Object source) {
		super(source);
	}

	public void mouseon() {
		System.out.println(source.toString() + " mouseon event happend");
	}
}
```

再定义按钮事件监听器，包括接口是实现

```java
/**
 * 事件监听器（按钮事件监听器，包括监听点击事件和鼠标事件）
 */
public interface ButtonEventListener extends EventListener {
    //监听器监听点击事件
	public void clickEvent(ButtonClickEvent event);
    //监听器监听鼠标事件
	public void mouseonEvent(ButtonMouseonEvent event);
}

/**
 * 对上面按钮监听器的具体实现
 */
public class MyButtonListener implements ButtonEventListener {
	@Override
	public void clickEvent(ButtonClickEvent event) {
		System.out.println("我是一个自定义监听器，我监听的点击事件发生了。。。");

		event.click();
	}

	@Override
	public void mouseonEvent(ButtonMouseonEvent event) {
		System.out.println("我是一个自定义监听器，我监听的鼠标事件发生了。。。");

		event.mouseon();
	}
}

```

在定义事件源Button对象
```java
/**
 * 事件源 （按钮就是事件源）
 */
public class Button {
	private Vector<ButtonEventListener> list = new Vector<ButtonEventListener>();
	//事件源对象包含所有监听它自己的监听器

    //可以给事件源添加监听器
	public void addListener(ButtonEventListener listener) {
		list.add(listener);
	}

	//事件源按钮的点击行为
	public void click() {
		for (ButtonEventListener listener : list) {
			listener.clickEvent(new ButtonClickEvent(this));
		}
	}

	//事件源按钮的鼠标行为
	public void mouseon() {
		for (ButtonEventListener listener : list) {
			listener.mouseonEvent(new ButtonMouseonEvent(this));
		}
	}
}
```

测试按钮监听：
```java
public class Main {
	public static void main(String[] args) {
		Button button = new Button();//定义按钮事件源

        //给按钮事件源添加匿名内部内的按钮事件监听器
		button.addListener(new ButtonEventListener() {
			@Override
			public void clickEvent(ButtonClickEvent event) {
				System.out.println("我是一个匿名监听器，我监听的点击事件发生了。。。");
				event.click();
			}

			@Override
			public void mouseonEvent(ButtonMouseonEvent event) {
				System.out.println("我是一个匿名监听器，我监听的鼠标事件发生了。。。");
				event.mouseon();
			}
		});
        //给按钮事件源添加一个自定义的按钮事件监听器
		ButtonEventListener listener = new MyButtonListener();
		button.addListener(listener);

		try {
			TimeUnit.MILLISECONDS.sleep(3000L);
			System.out.println("准备触发按钮事件。。。");
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
        //通过另一个线程触发按钮的点击动作和鼠标动作
		new Thread(new Runnable() {
			@Override
			public void run() {
				button.click();//按钮的点击动作

				button.mouseon();//按钮的鼠标动作
			}
		}).start();

		try {
			TimeUnit.MILLISECONDS.sleep(1000000L);
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
}
```
输出：
```xml
准备触发按钮事件。。。
我是一个匿名监听器，我监听的点击事件发生了。。。
com.gusi.demo.other.listener.Button@7ebd0226 click event happend
我是一个自定义监听器，我监听的点击事件发生了。。。
com.gusi.demo.other.listener.Button@7ebd0226 click event happend
我是一个匿名监听器，我监听的鼠标事件发生了。。。
com.gusi.demo.other.listener.Button@7ebd0226 mouseon event happend
我是一个自定义监听器，我监听的鼠标事件发生了。。。
com.gusi.demo.other.listener.Button@7ebd0226 mouseon event happend
```


  [1]: http://ox1nrsgam.bkt.clouddn.com/designerObserver1.jpg
  [2]: http://ox1nrsgam.bkt.clouddn.com/designerObserver2.jpg
