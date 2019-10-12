---
layout: post
title: Tensorflow基础和用法
date: 2019-05-12
categories: AI
tags: tensorflow
---



本文讲述了tensorflow的一些基础概念，常用的用法等。

### 下载安装TensorFlow
- 下载Anaconda
- 安装Anaconda（全程下一步）
- 创建虚拟环境：conda -n [env_name] python=[version]
- 激活虚拟环境：conda activate env_name
- 在线安装TF：pip install tensorflow 或者conda install tensorflow
- 验证安装结果：python:import tensorflow as tf

### TensorFlow基础知识

首先总览tensorflow：

![tensorflow](/assets/yoting/post/ai/TensorFlow01.png)

**Graph(图）**

Tensorflow中使用tf.Graph类表示可计算的图。图是由操作Operation和张量Tensor来构成，其中Operation表示图的节点（即计算单元），而Tensor则表示图的边（即Operation之间流动的数据单元）。

- 创建图：tf.Graph()

- 获取默认图：tf.get_default_graph()

 **Operation(操作，节点）**

一个Operation就是Tensorflow Graph中的一个计算节点。其接收零个或者多个Tensor对象作为输入，然后产生零个或者多个Tensor对象作为输出。

例如c = tf.matmul(a, b)表示创建了一个类型为MatMul的Operation，该Operation接收Tensor a和Tensor b作为输入，而产生Tensor c作为输出。

- 创建节点：Graph.create_op(params)；不常用

- 常用方式：直接调用Python operation方法（例如tf.matmul()）

**Tensor(张量，连线)**

Tensor表示的是Operation的输出结果。不过Tensor只是一个符号句柄，其并没有保存Operation输出结果的值。需要通过调用Session.run(tensor)或者tensor.eval()方可获取该Tensor的值。

- 组成：操作（名称）、维度、数据类型

- 属性：op(Operation)\dtype\graph\name\device\shape

- 常量张量：tf.constant(value, dtype=None, shape=None, name="Const", verify_shape=False)

- 随机张量：tf.random_normal(shape,mean=0.0,stddev=1.0, dtype=dtypes.float32,seed=None,name=None)

- 占位张量：tf.placeholder(dtype, shape=None, name=None)

- 改变形状：tf.reshape(tensor, shape, name=None)

- 类型转换：tf.cast(x, dtype, name=None)

- 求平均数：tf.reduce_mean(input_tensor,axis=None,keepdims=None,name=None,reduction_indices=None,keep_dims=None)

- 其他各种操作：...

**Session(会话）**

Session提供了Operation执行和Tensor求值的环境。

- 创建会话：tf.Session()

- 执行节点：sess.run(tensor)

- 关闭会话：sess.close()

**Variable(变量)**

在Tensorflow中当训练模型时，用变量来存储和更新参数。变量的申明函数Variable会被当最一个运算来处理，这个运算的输出结果就是要给张量（Tensor），变量包含张量存放于内存的缓存区。建模时它们需要被明确地初始化，模型训练后它们必须被存储到磁盘。值可在之后模型训练和分析时被加载。

- 创建变量：tf.Variable(initial_value=None,trainable=True,collections=None,name=None,其他参数)

- 重要属性：维度shape、类型type。类型不能改变，维度可以改变

- 获取、创建变量：get_variable(name,其他参数)

- 变量初始化：tf.global_variables_initializer()

- 变量作用域：variable_scope(name,其他参数)

- 变量集合：

    - tf.GraphKeys.LOCAL_VARIABLES 本地变量，不可共享
    - tf.GraphKeys.GLOBAL_VARIABLES 全局可共享的，默认的集合
    - tf.GraphKeys.TRAINABLE_VARIABLES 可以训练的



