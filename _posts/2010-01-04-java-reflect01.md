---
layout: post
title: Java反射基石Class类
date: 2014-10-29
categories: Java
tags: Java反射 Class类
---
　　Java是一门面向对象的编程语言，java程序中的各个java类也属于同一类事物（是一个对象），描述这类事物的java类就是Class。对于这样的一个类，也有他自己的属性和方法，等等。Java中使用字节码来将类的各种信息保存在硬盘上，当我们需要使用一个类的时候，就会加载对应类在硬盘上的字节码。

**类字节码的获取以及使用：**

**A.**我们如何得到一个类的字节码？有3中方式：
*假设：Person Person = new Person();*

1. 方式一：类.class 例如： Class clas1 = Person.class;
2. 方式二：对象.getClass() 例如： Class clas2 = person.getClass();
3. 方式三：Class.forName("className") 例如：Class clas3 = Class.forName("Person");

　　通过上面的三种方式得到了3份字节码，但是这3份字节码是相同的，也就是说clas1==clas2==clas3。需要注意的是，Class类没有公开的构造器，所以我们不能直接new Class();另外java中有9种预定义的Class类型，分别是：8中基本数据类型（byte、short、int、lang、float、double、boolean、char）和void。这9种预定义的类型分别也有他们自己的字节码。

**B.**得到java类的字节码以后，我们能有什么用？

- 我们可以通过字节码实例化这个类的一个对象

```java
clazz.newInstance();
```

- 我们可以得的这个类的一些信息，包括类的名字，包含的属性，方法，构造器等等。

```java
clazz.getName();
clazz.getConstructors();
clazz.getFields();
clazz.getMethods();
```

- 我们还可以判断这个类是不是数组，是不是基本类型，是不是接口等等。

```java
clazz.isPrimitive();
clazz.isArray();
clazz.isInterface();
```

**静态加载和动态加载：**

　*静态加载：编译时加载，在编译的时候，就需要将可能用到的类加载出来。*比如通过new方法创建的类，都是静态加载。只要有一个需要被静态加载的类不能成功加载，那么就会编译不通过。

　*动态加载：运行时加载，在运行的时候，再加载可能用到的类，如果找不到加载不成功，抛出异常。*比如通过类类型加载，使用反射技术加载类，这时编译时不会报异常，只有在运行时，可能抛出异常。比如Class.forName("MyClass"),只有在运行的时候，才会加载MyClass类。

**注意getFields()和getDeclaredFields(),getMethods()和getDeclaredMethods()的区别？**

　　没有declared的表示的是获得所有的public的域或方法，包括从父类继承下来的，而不包含public或者protected的。有declared的表示的是获得自己的说有的域或方法，包括私有的和受保护的，而不包含任何父类的。

**Class的基本API**

- 获得方法信息：

```java
Method[] methods = clazz.getMethods();

for(Method method:methods){

    ​method....

}
```

- 获得域信息：

```java
Field[] fields = clazz.getDeclaredFields();

for(Field field:fields){

    ​field....

}
```

- 获得构造器信息：

```java
Constructor[] constructors = clazz.getConstructors();

for(Constructor constructor:constructors){

    ​constructor....

}
```
 
**集合的泛型：**

```java
List list1 = new ArrayList();

List<String> list2 = new ArrayList<String>();

Class class1 = list1.getClass();

Class class2 = list2.getClass();

class1==class2;//ture
```

　　表示集合的泛型只是在编译的时候起作用，在运行的时候是去泛型化的，也就是在运行的时候，泛型是不起作用的。所以集合的泛型只能在编译的时候起到防止错误输入的作用，防止往集合中放入的对象的类型错我。因此我们可以通过反射绕过集合编译时的泛型验错，向集合中加入不同类型的对象。

```java
Method method = class2.getMethod("add",Object.class);

method.invoke(list2,123);//相当于调运list2.add(123)方法。
```

　　这个时候千万不要通过for循环遍历集合，会抛类转换异常。通过上面的反射技术，就可以向带泛型的集合中插入任意类型的对象。

　　java反射被用在很多地方，比如我们想得到一个对象私有属性或者给属性赋值，或者调运对象的私有方法等等。在一些常用的框架中也会使用到很多反射的知识，比如spring的IOC等等。
