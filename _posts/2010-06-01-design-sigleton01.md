---
layout: post
title: 单例模式
date: 2015-10-29
categories: "Design_Pattern"
tags: 单例
---
　　类和对象的关系很容易理解，对象就是类的一个具体实例。我们每个类可以创建多个对象，这些对象是相互独立不同的对象。但是有的时候我们的某个类只希望创建一个对象，不需要创建多个对象。比如框架加载在读取配置文件的时候，读取并保存配置文件信息的对象我们没必要创建多个，只要有一个对象读取到配置信息并保存在对象中，然后所有要使用到配置信息的地方都使用这个对象就可以了。如果有很多个对象读出来的配置是一样一样的，那么是完全没必要的，除了浪费资源。再比如我们的工具类、线程池、缓存、日志对象等等。对于这样的一些类，我们只希望永远有且只有一个对象的实例，那么我们就可以使用单例模式去创建实例。单例顾名思义就是只有一个实例，对于单例模式我们通常又有两种单例模式，分别是饿汉模式和懒汉模式。  
**1、饿汉单例：在类初始化的时候就加载**

```java
//饿汉单例模式
public class Singleton1 {
 // 定义一个单例类的实例对象instance，同时实例初始化，一定要用static修饰
 private static Singleton1 instance = new Singleton1();

 // 构造器是私有的，只能在该类中被使用，注意使用private修饰
 private Singleton1() {
 }

 // 对外提供一个访问获取该对象实例的方法，返回之前已经创建的实例
 public static Singleton1 getInstance() {
  return instance;
 }
}
```

**2、懒汉单例：只有在第一次用到的时候才会去加载**  

```java
//懒汉单例模式
public class Singleton2 {
 // 定义一个单例类的实例对象instance，但是暂时不创建该对象的实例，一定要用static修饰
 private static Singleton2 instance = null;

 // 构造器是私有的，只能在该类中被使用，注意使用private修饰
 private Singleton2() {
 }

 // 对外提供一个访问获取该对象实例的方法，返回上面定义的实例对象
 public static Singleton2 getInstance() {
  // 因为上面的实例对象在类初始化的时候并没有创建，所以在此处判断如果还没有实例化，就创建一个实例
  if (instance == null) {
   instance = new Singleton2();
  }
  // 返回实例的时候，一定是不为空的
  return instance;
 }
} 
```

　　饿汉模式是线程安全的，而懒汉模式因为在用到的时候才去加载，所以可能在多线程中同事请求创建实例，所以这就导致懒汉模式加载是线程不安全的。因此我们一般在使用懒汉模式的时候，会加入多线程控制，以多线程下也是正常的单例模式。代码写法一般有两种，一种是在方法上加入synchronized，另一种是将创建代码放在synchronized包裹的代码块中：  

```java
// 加入synchronized目的是防止多线程下创建多个实例，那样其实就不是单例了
public static synchronized Singleton2 getInstance() {
 if (instance == null) {
  instance = new Singleton2();
 }
 return instance;
}  
```

　　对于上面两种单例模式都有各自的缺陷，恶汉模式没有延迟加载，导致的结果可能是在初始化的时候，消耗太多资源。懒汉模式虽然延迟加载了，但是为了线程安全导致效率降低。  

**3、懒汉改版双重检测锁**

```java
public class Signleton3 {
	public static volatile Signleton3 instance = null;// volatile是关键

	private Signleton3() {

	}

	public static Signleton3 getInstance() {
		if (instance == null) {// 第一重检查
			synchronized (Signleton3.class) {
				if (instance == null) {// 第二重检查
					instance = new Signleton3();
				}
				return instance;
			}
		} else {
			return instance;
		}
	}
}
```

　　对于上面的双重检查锁，可以有效的避免多个线程来以后排队等待情况，应该如果一旦单例被初始化以后，就不需要再synchorized执行创建这个单例，但是这种方式一定要确保instance是volatile的，因为可能同时有多个线程获取instance，前面的线程已经获得锁，但是对象的创建需要一个过程（加载-连接-初始化），在这个过程中instance还没完全被创建，后面的线程发现这个instance不是null，可以通过第一重检查直接返回这个未完全创建的对象，这就导致后面线程获取的instance是有问题的。但是如果我们加上volatile就可以保证只有在instance彻底被创建以后别的线程才能读取到instance，这样就可以避免上面提到的问题。

**4、静态内部类单例**  

```java
//内部类获得饿汉单例模式
public class Singleton4 {
 // 定义一个内部类，该内部类持有一个外部类的实例对象
 private static class SingletonHolder {
  private final static Singleton4 INSTANCE = new Singleton4();
 }
 // 构造器是私有的，只能在该类中被使用，注意使用private修饰
 private Singleton4() {
 }
 // 对外提供一个访问获取该对象实例的方法
 public static Singleton4 getInstance() {
  // 通过内部类对象获取单例实例对象
  Singleton4 instance = SingletonHolder.INSTANCE;
  return instance;
 }
}  
```

　　这样做的目的是在类初始化的时候并不加载内部类对象，因为内部类没有被使用所以是不会加载的。当获取单例实例的时候，内部类会去实例化一个单例对象，然后返回给调运方，因为是static，所以java会保证该内部类只会创建一个，这样既保证了线程安全，也保证了延迟加载。

**总结**：如果在不要求延迟加载的情况下，建议使用第一种饿汉模式，如果在要求延迟加载的情况下，建议使用第三种以保证安全和效率，但是更推荐第四种写法，通过java内部的机制控制单例的有效性。单例模式还有一种创建方式，通过枚举，不过个人觉得很少用这两种方式，就不列举。  
