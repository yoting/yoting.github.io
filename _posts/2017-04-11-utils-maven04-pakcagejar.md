---
layout: post
title: Maven插件生成可执行的jar包
date: 2017-04-11
categories: "Common_Utils"
tags: maven
---

　　Maven对构建(build)的过程进行了抽象和定义，这个过程被称为构建的生命周期(lifecycle)。生命周期(lifecycle)由多个阶段(phase)组成,每个阶段(phase)会挂接一到多个目标(goal)。goal是maven里定义任务的最小单元，相当于ant里的target。

### Maven phase
- validate 验证项目是否正确以及必须的信息是否可用
- compile 编译源代码
- test 测试编译后的代码，即执行单元测试代码
- package 打包编译后的代码，在target目录下生成package文件
- integration-test 处理package以便需要时可以部署到集成测试环境
- verify 检验package是否有效并且达到质量标准
- install 安装package到本地仓库，方便本地其它项目使用
- deploy 部署，拷贝最终的package到远程仓库和替他开发这或项目共享，在集成或发布环境完成

　　以上的phase是有序的（注意实际两个相邻phase之间还有其他phase被省略，并非完整lifecycle），下一个phase的执行必须在上一个phase完成后。以phase为目标进行构建是最常见的，如我们平时经常执行的mvn compile,mvn test,mvn package...等等,compile,test,package都是maven生命周期(lifecycle)里的phase,通过mvn命令，你可以指定一次构建执行到那一个阶段，在执行过程中，所有经历的执行阶段(phase)上绑定的goal都将得到执行。例如，对于一个jar包应用，当执行mvn package命令时，maven从validate阶段一个阶段一个阶段的执行，直到执行到compile阶段时，compiler插件的compile goal会被执行，因为这个goal是绑定在compile阶段(phase)上的。

### Maven生成可执行的Jar包（包含其他依赖）

- **插件maven-assembly-plugin**

 　　引入assembly插件的依赖

```xml
<plugin>
    <artifactId>maven-assembly-plugin</artifactId>
    <version>2.2</version>
    <configuration>
        <archive>
            <manifest>
                <!-- 注意这个地方需要指定jar包执行入口 -->
                <mainClass>com.gusi.demo.Main</mainClass>
            </manifest>
        </archive>
        <descriptorRefs>
            <!--指定生成的jar包的后缀-->
            <descriptorRef>jar-with-dependencies</descriptorRef>
        </descriptorRefs>
    </configuration>
</plugin>
```

- 通过插件执行命令
    - 命令为：mvn assembly:assembly，注意需要在项目路径下
    - 也可通过IDE中直接运行assembly:assembly
    - 生成的后最美为jar-with-dependencies.jar包的文件位于target目录下
- 运行可执行的Jar包
    - 命令：java -jar xxx-jar-with-dependencies.jar
    
　　但是该插件生成的jar包中如果含有xml配置文件，比如通过spring的xml配置文件定义bean，那么它是不能把xml的schemal相关的xsd引入，所以对于这种jar包，直接运行是会报错的，这是assembly的一个bug，所以这个时候，我们需要用另一个插件shade

- **插件maven-shade-plugin**
    
　　引入shade插件的依赖，并且配置插件

```xml
<plugin>
	<groupId>org.apache.maven.plugins</groupId>
	<artifactId>maven-shade-plugin</artifactId>
	<version>1.4</version>
	<executions>
		<execution>
			<phase>package</phase>
			<goals>
				<goal>shade</goal>
			</goals>
			<configuration>
				<filters>
					<filter>
						<artifact>*:*</artifact>
						<excludes>
							<exclude>META-INF/*.SF</exclude>
							<exclude>META-INF/*.DSA</exclude>
							<exclude>META-INF/*.RSA</exclude>
						</excludes>
					</filter>
				</filters>
				<shadedArtifactAttached>true</shadedArtifactAttached>
				<!-- 指定生成jar包的后缀，可以是任意字符串 -->
				<shadedClassifierName>shade</shadedClassifierName> 
				<transformers>
					<transformer
						implementation="org.apache.maven.plugins.shade.resource.ManifestResourceTransformer">
						<mainClass>com.gusi.demo.Main</mainClass>
						<!--配置jar包的启动入口main方法为位置-->
					</transformer>
					<transformer
						implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
						<resource>META-INF/spring.handlers</resource>
					</transformer>
					<transformer
						implementation="org.apache.maven.plugins.shade.resource.AppendingTransformer">
						<resource>META-INF/spring.schemas</resource>
					</transformer>
				</transformers>
			</configuration>
		</execution>
	</executions>
</plugin>
```
　　通过上面的配置，只要在执行到package phase，那么就会在对应的目录下生成对应jar包，再通过java -jar xxx-shade.jar就可运行该项目。