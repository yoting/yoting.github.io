---
layout: post
title: 设计模式之适配器模式
date: 2016-08-14
categories: "Design_Pattern"
tags: design
---

### 一：适配器模式的定义

　　适配器模式：将一个类的接口转换成客户希望的另一个接口。适配器模式让那些接口不兼容的类可以一起工作

　　适配器模式的别名为包装器(Wrapper)模式，它既可以作为类结构型模式，也可以作为对象结构型模式。在适配器模式定义中所提及的接口是指广义的接口，它可以表示一个方法或者方法的集合。

### 二：适配器模式的结构

　　类适配器模式结构图：

　　		![img](http://ox1nrsgam.bkt.clouddn.com/designerAdapter2.png)

　　对象适配器结构图：

　　　　![img](http://ox1nrsgam.bkt.clouddn.com/designerAdapter1.png)

 

　　由图可知适配器模式包含一下三个角色：

- Target(目标抽象类)：目标抽象类定义客户所需的接口，可以是一个抽象类或接口，也可以是具体类。在类适配器中，由于C#语言不支持多重继承，所以它只能是接口。
- Adapter(适配器类)：它可以调用另一个接口，作为一个转换器，对Adaptee和Target进行适配。它是适配器模式的核心。
- Adaptee(适配者类)：适配者即被适配的角色，它定义了一个已经存在的接口，这个接口需要适配，适配者类包好了客户希望的业务方法。


### 三：适配器模式的实现

​	定义一个target接口：

```java
package com.gusi.demo.adapter;

/**
 * 定义客户端使用的接口，与业务相关
 */
public interface ITarget {
	/**
	 * 客户端请求处理的方法
	 */
	void request();
}
```

​	定义适配者Adaptee:

```java
package com.gusi.demo.adapter;

/**
 * 已经存在的接口，这个接口需要配置
 */
public class Adaptee {
	/**
	 * 原本存在的方法
	 */
	public void specificRequest() {
		// 业务代码
		System.out.println("适配方法doing something...");
	}
}
```

​	适配器（对象适配）：

```java
package com.gusi.demo.adapter;

/**
 * 适配器类(对象适配器)
 */
public class Adapter1 implements ITarget {
	/**
	 * 持有需要被适配的接口对象
	 */
	private Adaptee adaptee;

	/**
	 * 构造方法，传入需要被适配的对象
	 *
	 * @param adaptee 需要被适配的对象
	 */
	public Adapter1(Adaptee adaptee) {
		this.adaptee = adaptee;
	}

	@Override
	public void request() {
		adaptee.specificRequest();
	}

}
```

​	适配器（接口适配）:

```java
package com.gusi.demo.adapter;

/**
 * 适配器类(接口适配器)
 */
public class Adapter2 extends Adaptee implements ITarget {
	@Override
	public void request() {
		specificRequest();
	}
}
```

​	客户端使用：

```java
package com.gusi.demo.adapter;

/**
 * 使用适配器的客户端
 */
public class Main {
	public static void main(String[] args) {
		// 创建需要被适配的对象
		Adaptee adaptee = new Adaptee();
		// 创建客户端需要调用的接口对象
		ITarget target1 = new Adapter1(adaptee);
		// 请求处理
		target1.request();

		ITarget target2 = new Adapter2();
		target2.request();
	}
}
```

### 四：适配器模式的运用

​	在为某学校开发教务管理系统时，开发人员发现需要对学生成绩进行排序和查找，该系统的设计人员已经开发了一个成绩操作接口ScoreOperation，在该接口中声明了排序方法sort(int[] array) 和查找方法search(int[] array, int key)。为了提高排序和查找的效率，开发人员决定重用现有算法库中的快速排序算法类QuickSort和二分查找算法类BinarySearch，其中QuickSort的quickSort(int[] array)方法实现了快速排序，BinarySearchClass的binarySearch (int[]array, int key)方法实现了二分查找。由于某些原因，开发人员已经找不到该算法库的源代码，无法直接通过复制和粘贴操作来重用其中的代码；而且部分开发人员已经针对ScoreOperation接口编程，如果再要求对该接口进行修改或要求大家直接使用QuickSortClass类和BinarySearchClass类将导致大量代码需要修改。

​	现使用适配器模式设计一个系统，在不修改已有代码的前提下将类QuickSort和类BinarySearch的相关方法适配到ScoreOperation接口中。具体代码如下：

​	成绩操作接口定义：

```java
package com.gusi.demo.adapter.example;

/**
 * target
 */
public interface ScoreOperate {
	int[] sort(int[] scores);

	boolean search(int[] scores, int find);
}
```

​	QuickSort和BinarySearch假设来源于第三方jar包，我们不需要知道其源码，将这两个类充当适配者，我们可能只知道其中有对应接口方法：

```java
public class BinarySearch {
	public int binarySearch(int[] array, int key) {
		// 查找是否有key存在
		System.out.println("二分查找。。。 具体实现省略");
		return 0;
	}
}

public class QuickSort {
	int[] quickSort(int[] array) {
		// 对array排序
		System.out.println("快速排序。。。 具体实现省略");
		return array;
	}
}
```

​	定义我们的成绩操作适配器：

```java
package com.gusi.demo.adapter.example;

/**
 * adapter
 */
public class OperateAdapter implements ScoreOperate {
	private QuickSort quickSort;
	private BinarySearch binarySearch;

	public OperateAdapter(QuickSort quickSort, BinarySearch binarySearch) {
		this.quickSort = quickSort;
		this.binarySearch = binarySearch;
	}

	@Override
	public int[] sort(int[] scores) {
		return quickSort.quickSort(scores);
	}

	@Override
	public boolean search(int[] scores, int find) {
		int result = binarySearch.binarySearch(scores, find);
		return result == 1;
	}
}
```

​	客户端使用：

```java
public class Main {
	public static void main(String[] args) {
		BinarySearch binarySearch = new BinarySearch();
		QuickSort quickSort = new QuickSort();
		ScoreOperate operate = new OperateAdapter(quickSort, binarySearch);
		int[] result = operate.sort(new int[] { 88, 98, 24, 65, 45 });
		boolean find1 = operate.search(new int[] { 88, 98, 24, 65, 45 }, 55);
		boolean find2 = operate.search(new int[] { 88, 98, 24, 65, 45 }, 24);

		System.out.println(Arrays.toString(result));
		System.out.println(find1);
		System.out.println(find2);
	}
}

//out：
[24, 45, 65, 88, 98]
false
true
```

### 五：适配器模式总结

​	**适配器模式的三个特点：**

- 适配器对象实现原有接口


- 适配器对象组合一个实现新接口的对象（这个对象也可以不实现一个接口，只是一个单纯的对象）


- 对适配器原有接口方法的调用被委托给新接口的实例的特定方法

  **优缺点和适用场景：**


- 优点：可以在不修改原有代码的基础上复用现有的类，很好的遵守“开闭原则”.


- 缺点：针对基本代码，重定义Adaptee的行为比较困难，这就需要生成Adaptee的子类并且使得Adapter引用这个子类而不是Adaptee本身。


- 适用场景：系统需要复用现有类，而该类的接口不符合系统的需求。

  ​**适配器模式是指定义一个适配器类，将一个已经存在的类，转换成目标接口所期望的行为形式。**实际应用中，更常用的是对象适配模式。相比较接口适配模式，对象适配模式主要使用组合适配者而不是继承适配者，起到解耦的作用，同时可以突破Java的单继承的限制。
