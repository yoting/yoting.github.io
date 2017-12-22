---
layout: post
title: MySql日志binlog介绍
date: 2017-11-31
categories: "Database"
tags: mysql binlog
---

&ensp;&ensp;&ensp;&ensp;MySql在运行的过程中会产生一些日志，而现在对于主从数据的一致性同步问题，以及数据库恢复，数据库优化，数据库异常排查等动作都是同基于MySql的产生的日志来实现的。

- MySql日志种类
  - 错误日志：记录MySql运行过程中异常信息等。
  - 一般查询日志：记录 MySql正在做的事情，比如客户端的连接和断开、来自客户端每条 Sql Statement 记录信息等
  - 慢语句日志：记录一些查询比较慢的 SQL 语句，当我们发现系统运行比较慢的时候可以开启它，然后找到慢语句进行数据库调优等
  - binlog日志：记录包含了一些事件，这些事件描述了数据库的改动，如建表、数据改动等。

&ensp;&ensp;&ensp;&ensp;接下来主要介绍的是binlog日志，该日志主要应用场景是主从数据库的同步以及数据恢复两大类问题。

### binlog简介

- 开启binlog日志记录，需要在MySql的配置文件my.ini中加入配置：

```properties
log-bin=master-bin #日志文件前缀，比如master-bin.000001
log-bin-index=master-bin.index #记录日志文件的名称，内容为上面定义的日志文件名称
binlog-format=ROW #binlog日志的记录模式或者格式
```

- 重启MySql数据库服务，并且通过下面命令查询是否开启binlog：

```sql
show variables like 'log_%';
```

| Variable_name    | Value |
| ---------------- | ----- |
| log_slow_queries | ON    |


- binlog日志文件生成：日志文件以配置中的前缀开头，然后依次往后递加，比如从master-bin.000001到master-bin.00000n。
  - MySql服务器停止或重启时，MySql会在重启时生成一个新的日志文件。
  - 使用flush logs命令。另外可以使用reset master命令清空binlog日志。
  - 当binlog文件大小超过max_binlog_size系统变量配置的上限时。

- binlog日志格式分类：
    - Statement：基于语句模式，每一条会修改数据的sql都会记录在binlog中。
优点：不需要记录每一行的变化，减少了binlog日志量，节约了IO, 提高了性能。
缺点：由于记录的只是执行语句，为了这些语句能在slave上正确运行，因此还必须记录每条语句在执行的时候的一些相关信息，以保证所有语句能在slave得到和在master端执行的时候相同的结果。
    - Row：基于行模式，它不记录sql语句上下文相关信息，仅保存哪条记录被修改。
优点： binlog中可以不记录执行的sql语句的上下文相关的信息，仅需要记录那一条记录被修改成什么了。所以row的日志内容会非常清楚的记录下每一行数据修改的细节。而且不会出现某些特定情况下的存储过程，或function，以及trigger的调用和触发无法被正确复制的问题.
缺点:所有的执行的语句当记录到日志中的时候，都将以每行记录的修改来记录，这样可能会产生大量的日志内容。
	- Mixed：混个模式，实际上就是Statement与Row的结合。
在Mixed模式下，一般的语句修改使用statment格式保存binlog，如一些函数，statement无法完成主从复制的操作，则采用row格式保存binlog，MySql会根据执行的每一条具体的sql语句来区分对待记录的日志形式，也就是在Statement和Row之间选择一种。

- 通过以下一些命令查看binlog日志格式：

```sql
SHOW VARIABLES LIKE 'binlog_format';
```

| Variable_name | Value |
| ------------- | ----- |
| binlog_format | ROW   |


- 通过以下命令查询所有的binlog日志文件

```sql
SHOW BINARY LOGS;
```

| Log_name          | File_size |
| ----------------- | --------- |
| master-bin.000001 | 392       |
| master-bin.000002 | 126       |
| master-bin.000003 | 324       |


- 通过以下命令查看某个具体的binlog日志文件：（文件是二进制字节，只能通过MySql的工具打开）

```sql
SHOW BINLOG EVENTS IN 'master-bin.000001';
#PURGE MASTER LOGS TO 'master-bin.000001'; #该条语句删除具体的某个日志文件
```

这是Statement模式的日志，主要记录是向t_user中加入一条数据

| Log_name          | Pos  | Event_type  | Server_id | End_log_pos | Info                                     |
| ----------------- | ---- | ----------- | --------- | ----------- | ---------------------------------------- |
| master-bin.000001 | 4    | Format_desc | 1         | 107         | Server ver: 5.5.41-enterprise-commercial-advanced-log, Binlog ver: 4 |
| master-bin.000001 | 107  | Query       | 1         | 181         | BEGIN                                    |
| master-bin.000001 | 181  | Intvar      | 1         | 209         | INSERT_ID=2                              |
| master-bin.000001 | 209  | Query       | 1         | 346         | use `demobinlog`; insert into t_user(name,age,isman,remark) values('hhh',12,1,'kkkkk') |
| master-bin.000001 | 346  | Xid         | 1         | 373         | COMMIT /* xid=16 */                      |
| master-bin.000001 | 373  | Stop        | 1         | 392         |                                          |

这是Row模式的日志，同样是向t_user中添加一行数据

| Log_name          | Pos  | Event_type  | Server_id	End_log_pos | Info                                     |
| ----------------- | ---- | ----------- | --------------------- | ---------------------------------------- |
| master-bin.000003 | 4    | Format_desc | 1	107                 | Server ver: 5.5.41-enterprise-commercial-advanced-log, Binlog ver: 4 |
| master-bin.000003 | 107  | Query       | 1	181                 | BEGIN                                    |
| master-bin.000003 | 181  | Table_map   | 1	240                 | table_id: 33 (demobinlog.t_user)         |
| master-bin.000003 | 240  | Write_rows  | 1	297                 | table_id: 33 flags: STMT_END_F           |
| master-bin.000003 | 297  | Xid         | 1	324                 | COMMIT /* xid=7 */                       |


&ensp;&ensp;&ensp;&ensp;以上只是简单介绍MySql的binlog日志的产生以及查看等待，对于binlog日志内容中更详细的介绍将在以后的博客中详细介绍。
