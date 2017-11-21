---
layout: post
title: Java集合和数组的转换
date: 2014-10-01
categories: Java
tags: Java集合
---


# Java集合和数组的转换

&ensp;&ensp;&ensp;&ensp;在开发中，我们经常需要将集合对象（List，Set）转换为数组对象，或者将数组对象转换为集合对象。Java提供了相互转换的工具，但是我们使用的时候需要注意，不能乱用滥用。

**1、数组对象转换为集合对象**
　　最暴力的方式是new一个集合对象，然后遍历数组，依次将数组中的元素放入到新的集合中，但是这样做显然过于麻烦。Java中有一个工具类Arrays类，提供一个方法asList()可以直接将数组转换为List集合。但是一定要注意，Arrays.asList(T... a)返回的是一个固定长度的ArrayList,是不能对返回的list进行add或者remove等操作的，因为返回的并不是java.util.ArrayList对象，是java.util.Arrays.ArrayList对象，是Arrays类的内部类。查看源码可以知道如果对该类进行add等操作，是要抛出异常的。该类的定义是起到一个桥梁作用，如果我们需要对转换的List集合进行修改操作，我们可以通过List<T> list = new ArrayList<T>(Arrays.asList(array));的方式，这样产生的list是觉得可以修改的。代码实现如下：

```java
String[] arrStr = {"a","b","c"};  
List<String> list1 = Arrays.asList(arrStr);  
List<String> list2 = new ArrayList<String>(Arrays.asList(arrStr));
```
结论：如果我们需要将数组转换为可修改的集合List就使用List<T> list = new ArrayList<T>(Arrays.asList(array));如果我们对转换的集合不修改就直接使用List list = Arrays.asList(array);

**2、集合对象转换为数组对象**
　　这个就简单了一常用了，直接使用List接口的toArray方法。需要注意的是List有两个重载的toArray方法，第一个List.toArray()返回Object[],第二个List.toArray(T[] a)返回T[].那到底使用哪个呢，两种方法有什么区别呢？第一种返回的是Object[]类型，如果我们想要转换的数组的类型不是Object,那就需要向下转型，但是向下转型会导致类型不兼容，所以会抛出异常，但是我们可以遍历Object[]数组，让后将数组中的每一个元素进行类型转换，这样就不会类型转换异常。通常我们使用带参数的方法，这样就可以通过泛型，返回特定类型的数组，就不用再依次转换了。比如我们将List<String>转换为String[],我们可以通过下面的代码实现：

```java
List<String> listStr = new ArrayList<String>();  
listStr.add("one");  
listStr.add("two");  
String[] arrStr1 = listStr.toArray(new String[] {});  
String[] arrStr2 = listStr.toArray(arrStr1);  
String[] arrStr3 = (String[]) listStr.toArray();//这样是不行的。不能直接将Object[]转换为String[]
```

结论：将集合转换为数组，最好使用toArray(T[] t)方法返回指定类型的数组。
​
**3、判断某个元素是否属于集合或者数组**
　　对于集合对象，提供了直接使用的方法。可以通过contailns方法判断。当然也可以自己使用最暴力的方式，遍历集合中的所有元素。
　　对于数组对象，没有直接使用的方法，我们可以使用最暴力的方式，遍历数组，但是显然这样做不优雅。所以我们可以借助上面说的现将数组对象转换为集合对象，然后使用集合的contains方法。如果我们只是想判断特定元素是否存在于数组对象中，不对原数据进行修改，那么就可以直接使用Arrays.asList()方法，生成一个固定大小的List，然后直接使用contains方法，具体代码如下：

```java
List<String> listStr = new ArrayList<String>();  
listStr.add("a");  
listStr.add("b");  
listStr.add("c");  
boolean result1 = listStr.contains("d");//false  
String[] arrStr= {"a","b","c"};  
boolean result2 = Arrays.asList(arrStr).contains("a");//true
```