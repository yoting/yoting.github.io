---
layout: post
title: Java中自定义注解的使用
date: 2017-08-09
categories: "Java"
tags: annotation
---

&ensp;&ensp;&ensp;&ensp;在Java中，尤其是在JavaEE开发中，注解是很常用的东西，比如spring中有很多注解等等。大部分时间我们在使用注解的时候，都会觉得它用起来特别方便，只需要一个小小的注解就可以帮我们完成很多事。但是有时候我们有些已经明确的流程化的东西却不能找到一个有效的注解来帮我们完成该流程，那么我们可能有两种方式来处理，第一是每次都写很多重复的代码。第二是我们自己自定义注解，来固化该流程代码，减少我们重复的复制代码。接下来就简单介绍一下自定义注解的实现方式。

### 自定义注解

- 元注解
&ensp;&ensp;&ensp;&ensp;元注解的作用就是负责注解其他注解，由java提供。元注解共有一下四种：

    - @**Target**：用于描述注解的使用范围，取值为枚举类型，可以是类上、属性上、方法上等
    - @**Retention**：表示需要在什么级别保存该注释信息，用于描述注解的生命周期，取值为枚举类型，可以是运行时有效、源文件见中有效或者class文件中有效
    - @**Documented**：是一个标记注解，没有成员，可以被例如javadoc此类的工具文档化
    - @**Inherited**：是一个标记注解，如果一个使用了@Inherited修饰的annotation类型被用于一个class，则这个annotation将被用于该class的子类。

- 定义自定义注解的方式
    - 通过@interface定义一个自定义注解
    - 使用元注解修饰自定义注解
    - 定义自定义注解的成员（属性），类似于定义接口方法，同时还可以给设置默认值

- 自定义一个注解的代码如下所示：

```java
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.FIELD)
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CalculateAnnotation {
    //枚举类型的注解属性
    Type type();

    //枚举运算符号类型
    enum Type {
        ADD(1), SUBTRACT(2);
        private int value;

        Type(int value) {
            this.value = value;
        }

        int getValue() {
            return this.value;
        }
    }

    //可以给注解设置默认值
    int defaultValue() default 0;

    boolean needStr2Num() default false;
}
```

### 通过反射获取注解并且使用它

&ensp;&ensp;&ensp;&ensp;上面已经定义了一个注解，我们将上面的注解的运用在对象属性上

- 上面的注解共有三个属性，他们的含义分别是：
    - 当属性上的注解的type是ADD的时候我们就将多个对象的该属性的值相加，如果是SUBTRACT就相减。
    - 如果对象该属性是空，我们就用注解上定义的默认值给属性设置默认值。
    - 如果属性需要从字符串转换为数字类型，我们就将属性进行强制类型转换

- 首先定义类，然后使用该注解：

```java
public class DemoEntity {

    @CalculateAnnotation(type = CalculateAnnotation.Type.ADD, defaultValue = 1)
    private Integer attrAdd;//定义该属性为ADD类型，默认值为1
    @CalculateAnnotation(type = CalculateAnnotation.Type.SUBTRACT, needStr2Num = true)
    public String attrSub;//定义改善属性为SUBTRACT类型，同时需要将字符串转换为数字

    public DemoEntity() {
    }

    public DemoEntity(int attrAdd, String attrSub) {
        this.attrAdd = attrAdd;
        this.attrSub = attrSub;
    }

    public Integer getAttrAdd() {
        return attrAdd;
    }

    public void setAttrAdd(Integer attrAdd) {
        this.attrAdd = attrAdd;
    }

    public String getAttrSub() {
        return attrSub;
    }

    public void setAttrSub(String attrSub) {
        this.attrSub = attrSub;
    }
}

```

- 接下来通过反射获取对象属性上的注解，并且进行计算处理：

```java
import java.lang.annotation.Annotation;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;
import java.util.HashMap;
import java.util.Map;

public class DemoMain {
    public static void main(String[] args) {
        //定义两个被标注了@CalculateAnnotation的对象
        DemoEntity entity1 = new DemoEntity(123, "332");
        DemoEntity entity2 = new DemoEntity(22, "32");
        DemoEntity result = new DemoEntity();//结果对象

        //获取该类的所有field
        Field[] fields = DemoEntity.class.getDeclaredFields();
        //遍历所有field，同时获取每个field上的注解对象，存放到map中
        Map<Field, Annotation> annotationMap = new HashMap<Field, Annotation>();
        for (Field field : fields) {
            CalculateAnnotation annotation = field.getAnnotation(CalculateAnnotation.class);
            annotationMap.put(field, annotation);
        }

        //遍历map，依据field上的annotation处理每个filed
        for (Map.Entry<Field, Annotation> entry : annotationMap.entrySet()) {
            Field field = entry.getKey();
            CalculateAnnotation annotation = (CalculateAnnotation) entry.getValue();

            //通过注解获取到对象的值，并且处理运算出结果对象的值
            Object entity1Value = null;
            Object entity2Value = null;
            Object resultVelue = null;
            try {
                // 该处注意，对于private属性是不可以直接访问的，需要先设置accessible。
                // 另一只方式是通过属性的getter和setter获取和设置值
                if (!field.isAccessible()) {
                    field.setAccessible(true);
                }
                if (annotation.needStr2Num()) {
                    entity1Value = Integer.parseInt(field.get(entity1).toString());
                    entity2Value = Integer.parseInt(field.get(entity2).toString());
                } else {
                    entity1Value = field.get(entity1);
                    entity2Value = field.get(entity2);
                }
                if (annotation.type().getValue() == CalculateAnnotation.Type.ADD.getValue()) {
                    resultVelue = (Integer) entity1Value + (Integer) entity2Value;
                } else if (annotation.type().getValue() == CalculateAnnotation.Type.SUBTRACT.getValue()) {
                    resultVelue = (Integer) entity1Value - (Integer) entity2Value;
                }
                if (annotation.needStr2Num()) {
                    resultVelue = resultVelue.toString();
                }
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            }

            //通过set方法将结果值设置到结果对象中
            try {
                String setMethodName = "set" + field.getName().substring(0, 1).toUpperCase() + field.getName().substring(1);
                Method method = DemoEntity.class.getMethod(setMethodName, field.getType());
                //此处在之前已将将resultValue又转换为String类型，所以不需要再转换

//                if (field.getType() == String.class) {//类型判断可以直接通过==判断
//                    method.invoke(result, resultVelue.toString());
//                } else {
                method.invoke(result, resultVelue);//resultValue不管是Integer还是int都可以执行
//                }
            } catch (NoSuchMethodException e) {
                e.printStackTrace();
            } catch (IllegalAccessException e) {
                e.printStackTrace();
            } catch (InvocationTargetException e) {
                e.printStackTrace();
            }
        }
        System.out.println(result);
    }
}

```

- getDeclaredFields()和getFields()区别：
    - getFields()-获得某个类的所有的公共（public）的字段，包括父类中的字段。
    - getDeclaredFields()-获得某个类的所有声明的字段，即包括public、private和proteced，但是不包括父类的申明字段。
    - 同样类似的还有getConstructors()和getDeclaredConstructors()、getMethods()和getDeclaredMethods()，这两者分别表示获取某个类的方法、构造函数。

&ensp;&ensp;&ensp;&ensp;对于自定义注解的定义和使用基本上就是通过反射获取注解对象，然后再通过反射操作对象的属性的方法等。
