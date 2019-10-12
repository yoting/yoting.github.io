---
layout: post
title: Tensorflow和神经网络相关基础概念和术语
date: 2019-05-08
categories: AI
tags: tensorflow
---

本文主要讲述神经网络相关概念和tensorflow再神经网络中运用的相关术语。

### 深度学习涉及的概念

 **神经网络示意图**

![img](https://img-blog.csdn.net/20180702102749705?watermark/2/text/aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3UwMTQxMDU5ODc=/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70)

- x1、x2称为输入层；a11、a12、a13称为隐藏层；y称为输出层
- 神经网络就是让得到的y去匹配样本训练数据x对应的的一个标签y_
- 分为全连接神经网络、卷积神经网络、循环神经网络等

 **深度学习流程图**

![img](https://img-blog.csdn.net/20180205220441254?watermark/2/text/aHR0cDovL2Jsb2cuY3Nkbi5uZXQvdGlhbl9xaW5nX2xlaQ==/font/5a6L5L2T/fontsize/400/fill/I0JBQkFCMA==/dissolve/70/gravity/SouthEast)

 **前向传播算法**

- 前馈神经网络输入的$x$经过每一层的隐藏单元处理，最终产生输出的$y$。在训练过程中，前向传播会产生（计算）一个**损失函数**$J(w)$。计算前馈神经网络需要三部分信息：
  - 神经网络输入（经过提取的特征向量数据）
  - 神经网络的连接结构
  - 神经元中的参数
- 该算法有一定的局限性。因为该算法是线性模型，对于非线性应用不能很好的处理。

 **激活函数：实现去线性化**

- 常用的激活函数有下面几种：
  - ReLU（整流线性单元）
  - sigmoid（S型生长曲线）
  - tanh（双曲正切）
- 运用在输出单元上，让输出结果不再线性化。例如：a = tf.nn.reul(tf.matmul(x,w)+b)

 **损失函数**

- 描述对问题的求解精度，预测答案和真实答案之间的距离
- 交叉熵（Cross Entropy）：刻画的是两个概率分布（概率分布向量）之间的距离
  - 它要求神经网络的输出是一个概率分布。值越小表示距离越近。
  - tensorflow没有单独封装一个计算交叉熵函数，但是可以通过其他函数拼装起来。
    - reduce_mean(input_tensor,axis,keep_dims,name,reduction_indices)函数用于求平均值
    - log(x,name)函数用于求自然对数
    - clip_by_value(t,clip_value_min,clip_value_max,name)函数用于将张量中的数值限定在一个范围内
    - cross_entropy = tf.reduce_mean(y_*tf.log(tf.clip_by_value(y,le-10,1.0)))
- Softmax回归：将神经网络输出的值转换为概率分布向量
  - tf.softmax(logits,dim,name)函数。
  - 通常交叉熵函数和softmax回归同时使用，所以tensorflow封装了这两个功能为一个函数：nn.softmax_cross_entropy_with_logits()或nn.sparse_softmax_cross_entropy_with_logits()，后者主要适用于只有一个正确答案的分类问题
- 均方差：完成对具体数值的预测，主要用于回归问题
  - 回归问题的神经网络一般只有一个输出节点，这个节点的输出就是预测值。
- 自定义损失函数
  - tensorflow主要使用where函数和greater()函数实现
  - 例如：loss=tf.reduce_sum(tf.where(tf.greater(y,y\_),(y-y\_)\*a,(y\_-y)\*b))

 **基于梯度的优化**

- 假设$$w$$是函数的输入参数，$$J(w)$$ 是需要优化的函数，那么基于梯度的优化指的就是改变$$w$$以得到最大（最小）化的$$J(w)$$。

- 梯度下降算法

  - 寻找一个参数$w$，是的损失函数$J(w)$的值最小。会迭代的更新参数$w$，不断沿着梯度的反方向让参数朝着损失更小的方向更新。
  - 学习率：定义每次参数$w$更新的幅度。
  - 有两个缺点：一是不一定是全局最优解；二是优化速度比较慢。

- 随机梯度下降

  - 作为梯度下降算法的一个扩展。
  - 不是对全部训练数据上的损失函数进行优化，而是在每一轮迭代中随机选择某一个或多个训练数据上的损失函数进行梯度下降优化。
  - 缺点是在某些训练数据上的损失函数更小不代表全部训练数据上损失函数更小。

  ```python
  # 定义当前正在训练的轮数
  training_step = tf.Variable(0) #会随着训练的进行同步增大
  learning_step = tf.train.GradientDescentOptimizer(0.8).minimize(loss,global_step=training_step)
  # 使用一个梯度下降优化器，其中损失函数loss时目标函数，使得目标函数趋于最小值
  ```

  

 **反向传播算法**

- 反向传播算法允许来自损失函数的信息通过网络向后流动，以便计算梯度。
- 通过一种简单而廉价的计算在所有参数上使用梯度下降算法，这样就能是神经网络模型能够得到在训练数据上尽可能小的损失函数。
- 如果说梯度下降算法优化了单个参数的取值，那么反向传播算法则给出了一种高效的在所有参数上使用梯度下降算法。

 **学习率衰减算法**

- 学习率通常用于控制梯度下降中的参数更新的幅度或速度。

- 学习率不能太大，会导致参数的摆动。也不能太小，会降低模型优化速度。

- 参数太多，差别比较大时，需要对每个参数设置不同的学习率，通过一些算法自动适应这些参数的学习率。

- 自适应学习算法主要有：AdaGrad、RMSProp、Adam等

- 指数衰减的学习率：

  - 通过迭代逐步的减小已经设置好的学习率，使得模型在训练后期更加稳定。

  - tensorflow提供train.exponential_decay()函数可以对学习率进行指数形式的衰减。

    - learning_rate：初始学习率
    - global_step：当前训练进行的轮数
    - decay_steps：衰减速度
    - decay_rate：衰减系数
    - staircase：衰减方式。默认false表示指数形式的连续衰减，true表示decay_steps轮数后再更新学习率参数，一般使用global_step/decay_steps取近似值。这样就是一个阶梯函数。

    ```python
    training_step = tf.Variable(0)
    decayed_learning_rate = tf.train.exponential_decay(0.8,training_step,100,0.9,True)
    #初始化学习率为0.8；训练轮数随着训练进行而同步增大；每进行100轮后学习率乘以0.9
    ```

- 其他优化学习率方法：

  - 反时限学习率衰减
  - 自然指数学习率衰减
  - 分片常数学习率衰减
  - 多项式学习率衰减

 **拟合**

- 泛化误差：模型在未知新数据上得到的误差称为泛化误差，我们希望泛化误差很低

- 欠拟合：模型不能够在训练集上获得足够低的误差。比如模型容量（拟合各种函数的能力）不足。

- 过拟合：训练误差和测试误差之间的差距太大。比如模型容量太高，可能会被训练数据中的噪音影响。

- 正则化方法：解决过拟合问题

  - 思想是在损失函数中加入被正则化项的惩罚。

  - 假设模型在训练集上的损失函数为$J(w)$，参数w表示所有参数权重和偏置项，然后在优化时不直接优化$J(w)$,而是优化$J(w)+rR(w)$

  - L1正则化：对权重参数w求L1范数，会让参数变得稀疏。

  - L2正则化：对权重参数w求L2范数，该公式可导，所以损失函数的偏导数更简洁。

  - tensorflow 使用L2正则化方法：

    ```python
    # 用0.0001初始化L2正则化项的权重r
    regularizer = tf.contrib.layers.l2_regularizer(0.0001) #一般r都很小
    # 计算模型正则化损失
    regularization = regularizer(weights1) + regularizer(weights2)
    ```

- Bagging方法：降低泛化误差，分$k$个不同的训练模型，之后使用相同的测试集在这些模型上测试并收集所有模型在测试集上的输出。

- Dropout方法：解决过拟合问题，训练中随机丢弃某个神经单元。

 **滑动平均模型**

- 用来估计变量的局部均值，使得变量的更新与一段时间内的历史取值有关。

- 实现方式时通过对变量维护一个影子变量，影子变量的初始值就是变量的初始值，变量本身更新改变会同时更新影子变量的值。新影子变量值的更新会依赖旧影子变量的值。

- 滑动平均可以看作是变量的过去一段时间取值的均值，相比对变量直接赋值而言，滑动平均得到的值在图像上更加平缓光滑，抖动性更小，不会因为某次的异常取值而使得滑动平均值波动很大。

- tensorflow使用ExponentialMovingAverage类实现该模型，具体示例代码：

  ```python
  # 初始化一个滑动平均类，衰减率为0.99
  average_class = tf.train.ExponentialMovingAverage(0.99, training_step)
  # 定义更新滑动平均值的操作，训练所有变量
  average_op = average_class.apply(tf.trainable_variables())
  # 通过滑动平均方法average()获取影子变量的值参与计算
  average_y = hidden_layer(x,average_class.average(weights1),average_class.average(biases1),average_class.average(weights2), average_class.average(biases2), 'average_y')
  ```

