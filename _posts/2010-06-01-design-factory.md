---
layout: post
title: 设计模式之工厂模式
date: 2016-08-20
categories: "Design_Pattern"
tags: design
---

在分析工厂模式之前，我们使用发送消息这个动作作为示例。当我们需要发送消息的时候，我们可能会采用邮件发送，也可能采用短信发送或者直接使用微信发送等等，但是每种发送消息的具体实现又是不同的，比如邮件发送就需要使用邮件api，短信发送就需要使用短信通道。所以这两种发送消息的实现是不能共用。这时我们可以使用工厂模式便捷的完成我们的任务，当需要用邮件发送消息的时候，我们通过工厂获得一个邮件发送消息的对象，同样当需要使用短信发送消息的时候，我们通过工厂获得一个短信发送消息的对象。

### 简单工厂模式

我们首先定义一个Sender接口，然后再分别定义两个接口的实现类MailSender和SmsSender他们发分别完成邮件发送和短信发送。具体代码如下：

```java
//Sender.java:
public interface Sender{
    public void send();
}

//MailSender.java:
public class implement Sender{
    public void send(){
        System.out.println("use mail send msg!");
    }
}

//SmsSender.java:
public class implememnt Sender{
    public void send(){
        System.out.println("use sms send msg!");
    }
}
```

此时我们已经有了两个具体完成发消息的对象MailSender和SmsSender，可是当我们发消息的时候，如何获得对应的对象呢？此时使用工厂来获得，我们定义一个简单的工厂SimpleFactory，该工厂根据传入的请求参数类型判断返回的具体的Sender，比如传入mail表示获取MailSender对象，传入sms表示获取SmsSender对象，具体代码如下：
```java
//SenderFactory.java:
public class SimpleFactory{
    public static Sender createSender(String type){
        if("mail".equals(type)){
            return new MailSender();     
        }else if("sms".equals(type)){
            return new SmsSender();
        }else{
            return null;
        }
    }
}
```
这样我们就能按需获取对应的Sender，或者我们直接将两个Sender的获取分别写两个方法，使用者直接调运对应的工厂方法也可以获得对应的Sender，改造后的代码如下：
```java
//SimpleFactory.java
public class SimpleFactory{
    public static Sender createMialSender(){
        return new MailSender();
    }

    public static Sender createSmsSender(){
        return new SmsSender();
    }
}
```
上面就是简单工厂模式,为了方便调用，将工厂的方法都设置成static，他的类图如下：
![facotyUML](http://ox1nrsgam.bkt.clouddn.com/designerFactory.png)

但是当我们现在除了通过邮件和短信，还需要通过微信发送消息，怎么办？我们需要新写一个WexinSender对象实现Sender接口，同时需要修改SimpleFactory，添加if分支或者添加方法去创建WexinSender对象，这样就破坏了开闭原则——对扩展开放，对修改封闭。此时我们可以使用抽象工厂模式来重构上面的结构。

### 抽象工厂模式

同样我们需要上面的Sender接口，以及两个已经实现了Sender接口的MailSender和SmsSender，但是在生成或者获取具体的Sender的时候，不再用原来的工厂SimpleFactory，我们新起一个接口AbstractFactory来提供工厂。然后再对MailSender和SmsSender两个具体的Sender分别提供对应的MailFactory和SmsFactory，这两个Factory去实现AbstractFactory接口，当要获取具体的Sender的时候，通过AbstractFactory的对应的MailFactory或者SmsFactory获取对应的Sender。对应的代码如下：

```java
//AbstractFactory.java
public class AbstractFactory{
    public Sender createSender();
}

public MailFactory implement AbstractFactory{
    public Sender createSender(){
        return new MailSender();
    }
}

public SmsFactory implement AbstractFactory{
    public Sender createSender(){
        return new SmsSender();
    }
}
```
具体使用如下：
```java
public void main(String... args){
    AbstractFactory mailFactory = new MailFactory();
    Sender sender = mailFactory.createSender();
    sender.send();


    AbstractFactory smsFactory = new SmsFactory();
    Sender sender2 = smsFactory.createSender();
    sender2.send();
}
```
如果我们还需要使用微信发送消息，那么我们只需要再提供一个WexinFactory实现AbstractFactory接口，然后在调运的时候通过WeixinFactory的工厂获取Sender即可。

但是此时需求不仅仅是要求发送消息，还需要接受消息，通过邮件接受消息或者通过短信接受消息，没关系，对于抽象工厂能扩展这种需求。办法是再新建一个业务接口Reciever接口提供recieve()方法，同时提供MailReceiver和SmsReceiver的实现类去实现receive()方法，然后分别在MailFactory和SmsFactory工厂中提供createReceiver()方法去创建对应的Reciever即可，对应的代码是：

新建Receiver接口以及MailReceiver和SmsReceiver实现类:(这里和上面的Sender非常相似)
```java
//Receiver.java
public interface Receiver{
    public String receive();
}

//MialReceiver.java
public MailReceiver implement Receiver{
    public String receive(){
        System.out.println("use mail receive msg!");
    }
}

//SmsReceiver.java
public SmsReceiver implement Receiver{
    System.out.println("use sms receive msg!")
}
```
修改AbstractFactory接口以及MailFactory和SmsFactory实现类：(这里只是在原来的基础上加入Receiver相关方法)
```java
//AbstractFactory.java
public class AbstractFactory{
    public Sender createSender();
    public Reciever createReceiver();
}

public MailFactory implement AbstractFactory{
    public Sender createSender(){
        return new MailSender();
    }

    public Receiver createReceiver(){
        return new MialReceiver();
    }
}

public SmsFactory implement AbstractFactory{
    public Sender createSender(){
        return new SmsSender();
    }

    public Receiver createReceiver(){
        return new SmsReceiver();
    }
}
```

上面的代码对应的类图如下：
![facotyUML](http://ox1nrsgam.bkt.clouddn.com/designerFactory.png)

在使用时和上面相似，只需要通过对应的Factory创建对应的Sender和Reciever即可。假如需求更变态，要求的不是同类产品的产品族（这里邮件系统收发消息就属于同一产品族，短信收发消息属于另一产品族），比如他要求使用邮件发送消息，使用短信接受消息这样的一套产品，那么我们可以再建立一个XxxFactory去实现AbstractFactory，然后在实现createSender和createReceiver方法的时候，分别按照需求的制定去创建对应的Sender和Receiver即可。这里也就是强行将某几个非同类对象拉成同一产品族。 关于工厂模式的整体类图如下：包括简单工厂和抽象工厂 [image3]
