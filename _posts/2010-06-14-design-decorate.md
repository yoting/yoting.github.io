---
layout: post
title: 设计模式之装饰器模式
date: 2016-08-20
categories: "Design_Pattern"
tags: design decorate
---

### 装饰器模式概念：

​	装饰器模式（Decorator Pattern）允许向一个现有的对象添加新的功能，同时又不改变其结构。这种类型的设计模式属于结构型模式，它是作为现有的类的一个包装。

​	这种模式创建了一个装饰类，用来包装原有的类，并在保持类方法签名完整性的前提下，提供了额外的功能。

### 装饰器模式结构：

![img](http://ox1nrsgam.bkt.clouddn.com/designerDecorator.png)

​	由图可知装饰器模式主要包含以下几个角色：

- Component抽象构件角色：真实对象和装饰对象有相同的接口。这样，客户端对象就能够以与真实对象相同的方式同装饰对象交互。
- ConcreteComponent具体构件角色：真实对象。比如IO流中的FileInputStream、　　　　FileOutputStream，实现了InputStream和OutputStream接口。



- Decorator装饰角色：持有一个抽象构件的引用。装饰对象接受所有客户端的请求，并把这些请求转发给真实的对象。这样就能在真实对象调用前后增加新的功能。


- ConcreteDecorator具体装饰角色：负责给构件对象增加新的责任。

### 装饰器模式实现：

​	定义Componet接口：

```java
public interface Component {
     void operation();
}
```

​	定义ComPonet接口的真实对象：（被装饰对象）

```java
/**
 * 被装饰对象
 */
public class ConcreteComponent implements Component {
	@Override
	public void operation() {
		System.out.println("执行自己的工作职责。。。");
	}
}
```

​	定义装饰器：

```java
/**
 * 装饰器
 */
public class Decorator implements Component { //关键点1：继承Component
	private Component component; //关键点2：含有一个被装饰对象的引用

	public Decorator(Component component) {
		this.component = component;
	}

	@Override
	public void operation() {
		component.operation();
	}
}
```

​	定义具体的装饰器：（可以有多个不通的装饰器，并且在装饰器上还可以在包裹装饰器）

```java
/**
 * 具体装饰器
 */
public class ConcreteDecorator extends Decorator {
	public ConcreteDecorator(Component component) {
		super(component);
	}

	@Override
	public void operation() {
		super.operation();
		System.out.println("执行装饰器的职责。。。");
	}
}
```

​	客户端调运：

```java
public class Client {
	public static void main(String[] args) {
		Component component = new ConcreteComponent();
		component.operation(); // 不加装饰执行

		Decorator decorator = new ConcreteDecorator(component);
		decorator.operation();// 添加装饰执行
	}
}

//out:
执行自己的工作职责。。。
执行自己的工作职责。。。
执行装饰器的职责。。。
```

### 装饰器模式运用：

​	咖啡店里咖啡中可以加不同的配料–摩卡、牛奶、糖、奶泡；不同的饮品加上不同的配料有不同的价钱，怎样实现呢？可能你的第一印象会想到使用继承， 1. 首先定义一个咖啡基类 2. 对于加糖的，加牛奶的，加摩卡的 ，加奶泡的，分别写一个子类继承 3. 对于加糖，又加奶的写一个类，对于对于加糖，又摩卡的写一个类，对于对于加糖、又奶泡的写一个类，对于加糖，又加奶、摩卡的写一个类。。。

​	说到这里，你会发现这里四种配料就要写十几种实现类了，那如果我们的配料是二十几种或者三十几种呢，那么使用继承这种 方式肯定会使我们的子类爆炸，那要怎样解决你，答案就是使用装饰者模式。

​	首先定义咖啡的接口：

```java
/**
 * 咖啡（Component）
 */
public interface Coffee {
	int getPrice();

	String getName();
}
```

​	定义原味咖啡：

```java
/**
 * 原味咖啡（ConcreteComponent）
 */
public class SimpleCoffee implements Coffee {
	@Override
	public int getPrice() {
		return 12;
	}

	@Override
	public String getName() {
		return "原味";
	}
}
```

​	定义咖啡装饰器：

```java
/**
 * 装饰器
 */
public class Decorator implements Coffee {
	protected Coffee coffee;

	public Decorator(Coffee coffee) {
		this.coffee = coffee;
	}

	@Override
	public int getPrice() {
		return coffee.getPrice();
	}

	@Override
	public String getName() {
		return coffee.getName();
	}
}
```

​	最后定义不通的各种装饰器：

```java
/**
 * 加糖咖啡
 */
public class SugarCoffee extends Decorator {
	public SugarCoffee(Coffee coffee) {
		super(coffee);
	}

	@Override
	public int getPrice() {
		return super.getPrice() + 2; // 在原来的基础上加2元
	}

	@Override
	public String getName() {
		return super.getName() + "+糖";
	}
}


/**
 * 牛奶咖啡
 */
public class MilkCoffee extends Decorator {
	public MilkCoffee(Coffee coffee) {
		super(coffee);
	}

	@Override
	public int getPrice() {
		return super.getPrice() + 10; // 在原来的基础上加10元
	}

	@Override
	public String getName() {
		return super.getName() + "+牛奶";
	}
}
```

​	客户端调运：

```java
public class Main {
	public static void main(String[] args) {
		Coffee coffee = new SimpleCoffee();
		System.out.println(coffee.getName() + ":" + coffee.getPrice());

		SugarCoffee sugarCoffee = new SugarCoffee(coffee);
		System.out.println(sugarCoffee.getName() + ":" + sugarCoffee.getPrice());

		MilkCoffee milkCoffee = new MilkCoffee(coffee);
		System.out.println(milkCoffee.getName() + ":" + milkCoffee.getPrice());

		MilkCoffee milkSugarCoffee = new MilkCoffee(sugarCoffee);
		System.out.println(milkSugarCoffee.getName() + ":" + milkSugarCoffee.getPrice());
	}
}

//out:
原味:12
原味+糖:14
原味+牛奶:22
原味+糖+牛奶:24
```

### 装饰器模式总结：

　　装饰模式降低系统的耦合度，可以动态的增加或删除对象的职责，并使得需要装饰的具体构建类和具体装饰类可以独立变化，以便增加新的具体构建类和具体装饰类。

　　**优点**：

- 扩展对象功能，比继承灵活，不会导致类个数急剧增加
- 可以对一个对象进行多次装饰，创造出不同行为的组合，得到功能更加强大的对象
- 具体构建类和具体装饰类可以独立变化，用户可以根据需要自己增加新的具体构件子类和具体装饰子类

　　**缺点**：

- 产生很多小对象。大量小对象占据内存，一定程度上影响性能
- 装饰模式易于出错，调试排查比较麻烦
