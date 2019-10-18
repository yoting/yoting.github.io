---
layout: post
title: Zookeeper安装部署
date: 2019-02-16
categories: overall
tags: zookeeper
---

本文主要讲述zookeeper的安装以及集群配置相关内容。

- **下载安装**
    下载后解压到本地，修改conf目录下的zoo.cfg配置文件即可。解压后包含的各个文件夹：
    
    - **bin** ：zk的可执行脚本目录，包括zk服务进程，zk客户端，等脚本。其中，.sh是Linux环境下的脚本，.cmd是Windows环境下的脚本。
    - **conf** ：配置文件目录。zoo_sample.cfg为样例配置文件，需要修改为自己的名称，一般为zoo.cfg。log4j.properties为日志配置文件。
    - **lib **：zk依赖的包。
    - **contrib** ：一些用于操作zk的工具包。
    - **recipes** ：zk某些用法的代码示例
    
- **集群配置**

    集群中每个单实例只用分布配置zoo.cfg即可。zoo.cfg配置文件如下：

    ```pro
    # 心跳时间间隔
    tickTime=2000
    # 保存数据目录
    dataDir=d:/tmp/zookeeper0
    # 日志目录，如果不配置，和数据保存在一起
    dataLogDir=d:/tmp/zookeeper0/log
    # 监听端口
    clientPort=2180
    
    #配置follower与leader之间建立连接后进行同步的最长时间
    initLimit=5
    #配置follower和leader之间发送消息，请求和应答的最大时间长度
    syncLimit=2
    
    #集群配置
    server.0=127.0.0.1:8880:7770 
    server.1=127.0.0.1:8881:7771 
    server.2=127.0.0.1:8882:7772
    ```

    集群配置：server.id=host:port1:port2

    - id是集群的序号，每个实例需要在dataDir目录下创建实例的序号，文件名称为myid，文件内容为id的具体的编号，必须手动创建

    - host是实例所在的设备的ip地址
    - port1是leader和fllower实例进行数据交互的通信端口
    - port2是选举leader的通信端口
    - 如果是伪集群配置在一台机器上，需要各个port1和port2不同

- **启动**
  
    ```cmd
    zkServer.cmd
    ```
    
- **连接**
  
    ```cmd
    zkCli.cmd -server 127.0.0.1:2180,127.0.0.1:2181,127.0.0.1:2182
    ```
到底连接到那个实例上是随机的，也可指定某一个实例进行连接。成功连接后会输出“Welcome to ZooKeeper!”，之后就可以输入命令进行操作。
    
- **操作命令**
  
    - help：帮助 
    - ls：查看指定路径下包含的节点
    ```cmd
    ls /
    ```
    - create：创建节点以及节点包含的数据
    ```cmd
    create /zk nodeData
    ```
    - get：获取节点相关信息
    ```cmd
    get /zk
    ```
    - set：设置节点相关信息
    - delete：删除节点

- **远程连接**

  使用telnet或者nc连接后可以发送四字命令查看相关状态信息等。

  | 命令 | 描述                                                       |
  | ---- | ---------------------------------------------------------- |
  | conf | zk服务配置的详细信息                                       |
  | stat | 客户端与zk连接的简要信息                                   |
  | srvr | zk服务的详细信息                                           |
  | cons | 客户端与zk连接的详细信息                                   |
  | mntr | zk服务目前的性能状况                                       |
  | wchs | watch的简要信息                                            |
  | wchc | watch的详细信息，客户端 -> watch的映射，线上环境要小心使用 |
  | wchp | watch的详细信息, znode -> 客户端的映射，线上环境要小心使用 |