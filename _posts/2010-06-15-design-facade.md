---
layout: post
title: 设计模式之门面模式
date: 2016-08-10
categories: "Design_Pattern"
tags: design facade
---

### 门面模式概念

​	门面模式要求一个子系统的外部与其内部的通信必须通过一个统一的门面(Facade)对象进行。门面模式提供一个高层次的接口，使得子系统更易于使用。

​	比如去医院看病，可能要去挂号、门诊、划价、取药，让患者或患者家属觉得很复杂，如果有提供接待人员，只让接待人员来处理，就很方便。门面模式就如同医院的接待员一样，门面模式的门面类将客户端与子系统的内部复杂性分隔开，使得客户端只需要与门面对象打交道，而不需要与子系统内部的很多对象打交道。

### 门面模式结构

通过UML图可知门面模式主要涉及两个角色对象

- 门面(Facade)角色：客户端可以调用这个角色的方法。此角色知晓相关的(一个或者多个)子系统的功能和责任。在正常情况下，本角色会将所有从客户端发来的请求委派到相应的子系统去。


- 子系统(subsystem)角色：可以同时有一个或者多个子系统。每一个子系统都不是一个单独的类，而是一个类的集合。每一个子系统都可以被客户端直接调用，或者被门面角色调用。子系统并不知道门面的存在，对于子系统而言，门面仅仅是另外一个客户端而已

### 门面模式总结

​	门面模式主要是单独在各个错综复杂的子系统上做一个资源的整合，对原有子系统没有任何侵入。

**优点：**

- 减少系统的相互依赖。其他系统只依赖于门面，不依赖多个子系统。
- 提高了灵活性。不管子系统内部如何变化，对门面对象都没有影响。
- 提高安全性。在门面层可以做权限控制等。

**缺点：**

- ​ 门面模式最大的缺点就是不符合开闭原则，对修改关闭，对扩展开放。