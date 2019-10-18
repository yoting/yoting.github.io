---
layout: post
title: 设计模式之桥接模式
date: 2016-08-11
categories: "Design_Pattern"
tags: design
---

### 桥接模式定义

​	   将抽象部分与它的实现部分分离，使它们都可以独立地变化。它是一种对象结构型模式，又称为柄体(Handle and Body)模式或接口(Interface)模式。

​	   桥接模式是一种很实用的结构型设计模式，如果软件系统中某个类存在两个独立变化的维度，通过该模式可以将这两个维度分离出来，使两者可以独立扩展，让系统更加符合“单一职责原则”。与多层继承方案不同，它将两个独立变化的维度设计为两个独立的继承等级结构，并且在抽象层建立一个抽象关联，该关联关系类似一条连接两个独立继承结构的桥，故名桥接模式。

    桥接模式用一种巧妙的方式处理多层继承存在的问题，用抽象关联取代了传统的多层继承，将类之间的静态继承关系转换为动态的对象组合关系，使得系统更加灵活，并易于扩展，同时有效控制了系统中类的个数。

### 桥接模式结构

- Abstraction：抽象类，定义抽象接口，拥有一个Implementor类型的对象引用。

  它的角色就是桥接类。


- Refined Abstraction：这是Abstraction的子类，扩展Abstraction中的接口定义 。


- Implementor：是行为接口，Implementor和Abstraction接口并不一定要完全一致，实际上这两个接口可以完全不一样Implementor提供具体操作方法，而Abstraction提供更高层次的调用 。


- Concrete Implementor：Implementor的子类，具体行为实现类。

### 桥接模式实现

定义行为接口：

```java
public interface Implementor {
	void operation();
}
```

对上面的接口有多种实现：

```java
public class ConcreteImplementorB implements Implementor {
	@Override
	public void operation() {
		System.out.println("A");
	}
}

public class ConcreteImplementorB implements Implementor {
	@Override
	public void operation() {
		System.out.println("B");
	}
}
```

定义抽象接口：

```java
public abstract class Abstraction {
	Implementor implementor;

	public void setImplementor(Implementor implementor) {
		this.implementor = implementor;
	}

	abstract void operation();
}
```

定义一个或多个具体的抽象接口的实现类：

```java
public class RefinedAbstraction extends Abstraction {
	@Override
	void operation() {
		//实现自己更高级的业务
		implementor.operation();
	}
}
```

​	实现的核心是将对象的两个维度的变化分别定义成行为接口和抽象接口，同时抽象接口含有一个行为对象的引用。



### 桥接模式运用

​	   现在需要做一个数据库数据导出的工具ExportTool。导出文件类型可以有多种格式，比如支持导出txt、csv、execl等，另外还需要支持从多种数据库导出数据，比如从MySQL或Oracle导出。对于这个工具，显然有两个维度在变化，所以比较适合使用桥接模式设置该工具。

首先我们定义功能接口Exporter：

```java
/**
 * 导出接口（抽象功能接口Implementor）
 */
public interface Exporter {
	/**
	 * 导出数据对象
	 *
	 * @param datas
	 * @return
	 */
	boolean export(List<Object> datas);
}
```

对于不同的格式文件，定义不通的导出器：(TxtExporter、CsvExporter、ExeclExporter)

```java
/**
 * Txt类型导出
 */
public class TxtExporter implements Exporter {
	@Override
	public boolean export(List<Object> datas) {
		System.out.println("导出datas数据到txt文件中。");
		return true;
	}
}

/**
 * Csv类型导出
 */
public class CsvExporter implements Exporter {
	@Override
	public boolean export(List<Object> datas) {
		System.out.println("输出datas数据到csv文件中。");
		return true;
	}
}
```

再定义一个数据库导出对象的抽象类：

```java
/**
 * 抽象数据库类型Absraction
 */
public abstract class AbstractDb {

    /**
     * 导出接口对象
     */
	Exporter exporter;

	public void setExporter(Exporter exporter) {
		this.exporter = exporter;
	}

    /**
     * 导出数据到文件（从数据库读取文件，然后导出）
     * @return
     */
	abstract boolean exportDbToFile();
}
```

对于不同的数据库，有多种不同的读取数据和导出方式，每种数据库都继承抽象数据库接口：

```java
/**
 * mysql数据库
 */
public class MySQLDb extends AbstractDb {
	@Override
	boolean exportDbToFile() {
		System.out.println("从MySQL中读取数据。。。");
		List<Object> datas = new ArrayList<Object>();
		return exporter.export(datas);
	}
}

/**
 * oracle数据库
 */
public class OracleDb extends AbstractDb {
	@Override
	boolean exportDbToFile() {
		System.out.println("从Oracle中读取数据。。。");
		List<Object> datas = new ArrayList<Object>();
		return exporter.export(datas);
	}
}
```

客户端通过不通的数据导出不通的数据格式：

```java
public class Main {
    public static void main(String[] args) {
        AbstractDb db = new MySQLDb();
        Exporter exporter = new TxtExporter();
        db.setExporter(exporter);
        db.exportDbToFile();

        db = new OracleDb();
        exporter = new CsvExporter();
        db.setExporter(exporter);
        db.exportDbToFile();
    }
}

//out:
从MySQL中读取数据。。。
导出datas数据到txt文件中。
从Oracle中读取数据。。。
输出datas数据到csv文件中。
```

​	对于不通类型的数据扩展，只需要新定义数据库种类，然后实现抽象接口即可，同样对于新的导出文件类型种类，只需要新定义一个Exporter的实现类，比如新定义一个ExcelExporter将数据库文件导出到excel中。从而可以在两个维度上可随时扩展而不影响原有系统。

### 桥接模式总结

​	   桥接模式是指将抽象和行为划分开来，从而将各个可能变化的维度分离开来，各自独立成一个类，但是能够动态的组合。

**优点**

- 实现了抽象和实现部分的分离。桥接模式分离了抽象部分和实现部分，从而极大的提供了系统的灵活性，让抽象部分和实现部分独立开来，分别定义接口，这有助于系统进行分层设计，从而产生更好的结构化系统。对于系统的高层部分，只需要知道抽象部分和实现部分的接口就可以了。


- 更好的可扩展性。由于桥接模式把抽象部分和实现部分分离了，从而分别定义接口，这就使得抽象部分和实现部分可以分别独立扩展，而不会相互影响，大大的提供了系统的可扩展性。


- 可动态的切换实现。由于桥接模式实现了抽象和实现的分离，所以在实现桥接模式时，就可以实现动态的选择和使用具体的实现。


- 实现细节对客户端透明，可以对用户隐藏实现细节。

**缺点**

- 桥接模式的引入增加了系统的理解和设计难度，由于聚合关联关系建立在抽象层，要求开发者针对抽象进行设计和编程。


- 桥接模式要求正确识别出系统中两个独立变化的维度，因此其使用范围有一定的局限性。

**使用场景**

- 如果一个系统需要在构件的抽象化角色和具体化角色之间增加更多的灵活性，避免在两个层次之间建立静态的继承联系，通过桥接模式可以使它们在抽象层建立一个关联关系。


- 抽象化角色和实现化角色可以以继承的方式独立扩展而互不影响，在程序运行时可以动态将一个抽象化子类的对象和一个实现化子类的对象进行组合，即系统需要对抽象化角色和实现化角色进行动态耦合。


- 一个类存在两个独立变化的维度，且这两个维度都需要进行扩展。


- 虽然在系统中使用继承是没有问题的，但是由于抽象化角色和具体化角色需要独立变化，设计要求需要独立管理这两者。


- 对于那些不希望使用继承或因为多层次继承导致系统类的个数急剧增加的系统，桥接模式尤为适用
