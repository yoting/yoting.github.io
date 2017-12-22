---
layout: post
title: Websocket使用STOMP协议
date: 2017-11-21
categories: "Frame"
tags: websocket stomp
---
&ensp;&ensp;&ensp;&ensp;上一篇介绍了Websocket的相关概念以及简单的使用，接下来介绍通过STOMP协议，使用WebSocket来进行网页端和服务端的数据交互。

### STOMP协议介绍

&ensp;&ensp;&ensp;&ensp;直接使用WebSocket就类似于使用TCP套接字来编写web应用。而STOMP在WebSocket之上提供了一个基于帧的线路格式层，用来定义消息的语义。STOMP
的消息格式和HTTP请求结果很像，具体格式如下：

```xml
SEND
destination:/app/hello
content-length:20

{"message":"World!"}
```

&ensp;&ensp;&ensp;&ensp;STOMP由帧命令，一个或多个头信息以及负载所组成。上例中SEND就表示帧命令，表明会发送一些内容。接下来是两个头信息表明消息发送的目的地以及消息的大小。再接下来是一个空行（必须有一个空行），最后就是STOMP消息所负载的消息内容。

### WebSocket中使用STOMP协议(基于)

&ensp;&ensp;&ensp;&ensp;Spring为STOMP消息提供了基于SpringMvc的编程模型，在SpringMvc控制器中处理STOMP消息与处理HTTP消息类似。首先我们需要配置Spring启用基于STOMP的消息。

- **启用STOMP消息**

```xml
<websocket:message-broker application-destination-prefix="/app" user-destination-prefix="/user">
    <websocket:stomp-endpoint path="/stomp">
        <websocket:sockjs/>
    </websocket:stomp-endpoint>
    <websocket:simple-broker prefix="/topic,/queue"/>
</websocket:message-broker>
<!--   stomp and message broker config  end-->
```

&ensp;&ensp;&ensp;&ensp;该配置也可直接使用注解配置，但是含义都是一样，对于上面的配置中的几个路径的详细解释如下：(这些都是可配置的)
**/app**：应用地址前缀，客户端向服务端发送WebSocket消息到某个接口时候，都要带上该前缀，比如客户都发送消息地址为"/app/hello"
**/user**:发送一对一消息的固定前缀。当订阅的消息是/user开头时候，会特殊处理
**/stomp**：WebSocket的连接地址，再客户端创建WebSocket连接的时候，指向该地址，比如客户端连接地址为"http://localhost:8080/demoWebSocket/stomp"
**/topic，/queue**：消息代理目的地前缀，服务端返回的消息都会放在该前缀代理下。默认是只放在/topic下，比如默认会将消息放到"/topic/hello"下，这就需要客户端订阅该代理地址。

- **客户端发送STOMP消息到服务端**

&ensp;&ensp;&ensp;&ensp;通过javascript发送STOMP消息代码如下：

```html
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<html lang="en">
<head>
    <title>Hello WebSocket</title>
    <script src="http://cdn.bootcss.com/sockjs-client/1.1.1/sockjs.min.js"></script>
    <script src="http://cdn.bootcss.com/stomp.js/2.3.3/stomp.js"></script>
    <script src="http://cdn.bootcss.com/jquery/3.1.1/jquery.min.js"></script>
    <script type="text/javascript">
        var stompClient = null;

        function setConnected(connected) {
            document.getElementById('connect').disabled = connected;
            document.getElementById('disconnect').disabled = !connected;
            document.getElementById('conversationDiv').style.visibility = connected ? 'visible' : 'hidden';
            document.getElementById('response').innerHTML = '';
        }

        //连接到WebSocket
        function connect() {
            var userid = document.getElementById('name').value;
            var socket = new SockJS("http://localhost:8080/demoWebSocket/stomp");
            stompClient = Stomp.over(socket);
            stompClient.connect({name: 'aa'}, function (frame) {
                setConnected(true);
                ///topic/hello是/app/hello返回消息的默认地址
                stompClient.subscribe('/topic/hello', function (resultDto) {
                    alert(resultDto)
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
                ///app/hello1是直接订阅到接口
                stompClient.subscribe('/app/hello1', function (resultDto) {
                    alert(resultDto)
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
                ///topic/world1是/app/hello1返回消息重定位地址
                stompClient.subscribe('/topic/world1', function (resultDto) {
                    alert(resultDto)
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
                ///queue/world2是/app/hello2返回消息重定位地址
                stompClient.subscribe('/queue/world2', function (resultDto) {
                    alert(resultDto)
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
                ///user/queue/message是服务端发送消息给/queue/message目的地的订阅
                // 该种订阅方式是一对一的，不同的客户端连接会分别各自收到自己的消息
                stompClient.subscribe('/user/topic/message', function (resultDto) {
                    alert(resultDto);
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
                ///topic/hello3是服务端主动发送消息地址
                stompClient.subscribe('/topic/world4', function (resultDto) {
                    alert(resultDto)
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
                ///user/topic/message是服务端主动发送消息地址
                stompClient.subscribe('/user/queue/message', function (resultDto) {
                    alert(resultDto);
                    showResultMessage(JSON.parse(resultDto.body).content);
                });
            });
        }

        //断开WebSocket连接
        function disconnect() {
            if (stompClient != null) {
                stompClient.disconnect();
            }
            setConnected(false);
            console.log("Disconnected");
        }

        //展示接收的消息
        function showResultMessage(message) {
            var response = document.getElementById('response');
            var p = document.createElement('p');
            p.style.wordWrap = 'break-word';
            p.appendChild(document.createTextNode(message));
            response.appendChild(p);
        }

        //发送接收广播
        function sendBroadcast() {
            var name = document.getElementById('name').value;
            stompClient.send("/app/hello2", {
                atytopic: "greetings",
                simpSessionId: "hahahaha"
            }, JSON.stringify({'name': name, 'age': 12}));
        }

        //通过特定用户发送和接收
        function sendByUser() {
            stompClient.send("/app/hello3", {}, JSON.stringify({'name': "gusi", 'age': 22}));
        }
    </script>
</head>
<body>
<div>
    <div>
        <button id="connect" onclick="connect();">Connect</button>
        <button id="disconnect" disabled="disabled" onclick="disconnect();">Disconnect</button>
    </div>
    <div id="conversationDiv">
        <label>What is your name?</label><input type="text" id="name" value="gusi"/>
        <button id="sendBroadcast" onclick="sendBroadcast();">Send Broadcast</button>
        <button id="sendByUser" onclick="sendByUser();">Send By User</button>
        <p id="response"></p>
    </div>
</div>
</body>
</html>
```

&ensp;&ensp;&ensp;&ensp;客户端主要是通过js获取stompclient对象，然后通过该对象来send发送服务端消息，以及通过subscribe来订阅服务端的消息。需要注意的就是send消息的地址前缀和subscribe消息的前缀分别是什么。

- **服务端处理来自客户端的STOMP消息**

&ensp;&ensp;&ensp;&ensp;这里主要是顶一个Spring的controller，然后通过@MessageMapping@SubscribeMapping，以及@SendTo和@SendToUser注解定义接口和接口返回代理地址等，具体代码如下：

```java
package com.gusi.demo.WebSocket.stomp;

import org.Springframework.beans.factory.annotation.Autowired;
import org.Springframework.messaging.MessageHeaders;
import org.Springframework.messaging.handler.annotation.Header;
import org.Springframework.messaging.handler.annotation.Headers;
import org.Springframework.messaging.handler.annotation.MessageMapping;
import org.Springframework.messaging.handler.annotation.SendTo;
import org.Springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.Springframework.messaging.simp.SimpMessageSendingOperations;
import org.Springframework.messaging.simp.SimpMessageType;
import org.Springframework.messaging.simp.annotation.SendToUser;
import org.Springframework.messaging.simp.annotation.SubscribeMapping;
import org.Springframework.stereotype.Controller;
import org.Springframework.web.bind.annotation.PathVariable;
import org.Springframework.web.bind.annotation.RequestMapping;
import org.Springframework.web.bind.annotation.RequestMethod;
import org.Springframework.web.bind.annotation.ResponseBody;

import java.util.Map;

/**
 * WebSocket使用stomp接收发送消息
 */
@Controller
public class DemoWebSocketStompController {

    /**
     * 服务端主动给客户端发送消息的操作对象，再定义WebSocket的时候，内部已经向Spring容器注册该bean
     */
    @Autowired
    private SimpMessageSendingOperations simpMessageSendingOperations;

    private String simpSessionId = null;//临时存放客户端id，用于之后发送一对一消息。正常使用应该是放在map中

    /**
     * 表示服务端可以接收客户端通过主题"/app/hello"发送的消息，其中/app是配置的固定前缀<br>
     * 客户端需要在主题"/topic/hello"上监听并接收服务端发回的消息，或者在@SendTo指定地址接收消息
     *
     * @param topic
     * @param headers
     */
    @MessageMapping("/hello")//默认消息代理目的地为"/topic/hello"
    public ResultDto handleMessage(@Header("atytopic") String topic, @Headers Map<String, Object> headers, ClientVo vo) {
        System.out.println("message:" + vo);
        System.out.println(topic);
        System.out.println(headers);
        return new ResultDto("I know your name is:" + vo.getName() + ",and your age is:" + vo.getAge());
    }

    /**
     * 表示服务端可以监听客户端通过主题"/app/hello1"上订阅的消息，其中/app是配置的固定前缀<br>
     * 客户端要在主题"/topic/hello1"上监听并接收服端返回的消息，或者在@SendTo指定地址上接收消息
     *
     * @return
     */
    @SubscribeMapping("/hello1") //默认消息代理目的地为"/topic/hello1"
    @SendTo("/topic/world1") //设置消息代理目的地为"/topic/world3"
    public ResultDto handleSubscribe(@Headers Map<String, Object> headers) {
        System.out.println("subscribe");
        System.out.println(headers);
        this.simpSessionId = headers.get("simpSessionId").toString();//再客户端订阅的时候，将客户端的id存下来
        return new ResultDto("this is return subscribe");
    }

    /**
     * 该方法类似于hello接口方法
     *
     * @param headers
     * @param vo
     * @return
     */
    @MessageMapping("/hello2")//默认消息代理目的地为"/topic/hello2"
    @SendTo("/queue/world2") //设置消息代理目的地为"/queue/world2"
    public ResultDto handleMessage2(@Headers Map<String, Object> headers, ClientVo vo) {
        System.out.println("message:" + vo);
        System.out.println(headers);
        return new ResultDto("I know your name is:" + vo.getName() + ",and your age is:" + vo.getAge());
    }

    /**
     * 表示服务端可以监听客户端通过主题"/app/hello3"上发送的消息<br>
     * 服务端返回的消息是发送给特定用户的，不是所有监听了改地址的客户端都能收到，主要是使用了@SendToUser<br>
     * 客户端接收一对一消息的主题应该是“/user/” + 用户Id + “/topic/message”,但是客户端订阅的时候只需要订阅"/user/topic/message"
     *
     * @return
     */
    @MessageMapping("/hello3")
    @SendToUser("/topic/message")
    public ResultDto handleMessageToUser(@Headers Map<String, Object> headers) {
        System.out.println("this is the user message");
        System.out.println(headers);
        return new ResultDto("this is return message to user!");
    }
}
```

&ensp;&ensp;&ensp;&ensp;上面代码中还使用到了两个基础对象，分别是接收客户端数据的Vo对象ClientVo和返回数据对象ResultDto对象，它们的定义很简单，如下：

```java
package com.gusi.demo.WebSocket.stomp;

public class ClientVo {
    private String name;
    private int age;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    @Override
    public String toString() {
        return "name =" + name + " age =" + age;
    }
}

package com.gusi.demo.WebSocket.stomp;

public class ResultDto {
    private String content;

    public ResultDto(String content) {
        this.content = content;
    }

    public String getContent() {
        return content;
    }
}
```

### Spring中的STOMP部分细节说明

- 服务端几个注解的含义
    - @MessageMapping:服务端接收WebSocket消息的地址，搭配上配置的前缀组成完整地址路径。上例中的真实地址是：/app/hello。
    - @SubscribeMapping:服务端解接收WebSocket订阅的地址，搭配上配置的前缀组成完整地址路径。上例中的真实地址是：/app/hello1。
    - @SendTo:返回消息的地址，会改变默认值。默认情况下stomp发往的目的地会与触发处理器方法的目的地相同，只是前缀换成“/topic”。
    - @SendToUser：返回给某个特定用户消息的地址，默认情况下stomp发往的目的地址会是"/user"+userid+"/sendtovalue"。但是客户端订阅的时候只需要是"/user/sendtovalue"即可。

- SimpleMessagingTemplate的作用

&ensp;&ensp;&ensp;&ensp;服务端可以主动给客户端推送WebSocket消息，而不必客户端通过请求或订阅时候附带推送消息。具体使用方法如下：

```java
/**
 * 测试服务端主动发送消息给客户端
 *
 * @param type 发送消息类型
 * @return
 */
@RequestMapping(path = "/send/{type}", method = RequestMethod.GET)
@ResponseBody
public ResultDto send(@PathVariable("type") Integer type) {
    ResultDto resultDto = null;
    if (type == 1) {//发送给特定用户
        simpMessageSendingOperations.convertAndSendToUser(simpSessionId, "/topic/message", new ResultDto("send to user message!")/*, createHeaders(simpSessionId)*/);
        return new ResultDto("success to user!");
    } else {//发送广播
        simpMessageSendingOperations.convertAndSend("/topic/world4", new ResultDto("send boardcase message!"));
        return new ResultDto("success boardcast!");
    }
}

/**
 * 发送一对一消息时候构建消息头
 *
 * @param sessionId
 * @return
 */
private MessageHeaders createHeaders(String sessionId) {
    SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
    headerAccessor.setSessionId(sessionId);
    headerAccessor.setLeaveMutable(true);
    return headerAccessor.getMessageHeaders();
}
```
&ensp;&ensp;&ensp;&ensp;这里主要使用了SimpMessageSendingOperations的convertAndSend和convertAndSendToUser分别发送广播和一对一消息。尤其要注意再发送一对一消息的时候，需要设置唯一用户标识和消息头。上例中通过直接get方法就可以分别直接触发发送广播和发送一对一消息。

- 简单的STOMP消息代理（SimpleBroker）

&ensp;&ensp;&ensp;&ensp;这种消息代理是基于内存的。当消息到达时，目的地的前缀将会决定消息该如何处理。比如/app为前缀的消息，将直接路由到带有@MessageMapping的注解的控制器方法中。而发送到代理的消息，将会路由到代理上，并最终发送订阅这些目的地的客户端。具体模型图如下：



&ensp;&ensp;&ensp;&ensp;当然处理使用上面那种简单的基于内存的消息代理处理，还可以使用真正的消息代理，比如ActiveMQ、RabbitMQ等，只需要在配置StompBrokerRelay即可，当然配置StompBrokerRelay的时候，需要再额外配置连接地址端口以及登录用户名密码等。对应的模型图只需要把上面的SimpleBrokerMessageHandler换成StompBrokerRelayMessageHanlder即可。

- 消息对象转换

&ensp;&ensp;&ensp;&ensp;上例中服务端接收消息和发送代理消息都是直接使用对象的方式，但是客户端接收和发送其实是使用Json字符串。这其中隐含了Json和对象的转换，就像我们使用SpringMvc的时候，会将对象和Json转换，只需要在classpath下包含对应的jar包即可。具体的比如json转换可以使用MappingJsckson2MessageConvert来转换。在转换对象上，同样可以加上jackson的一些注解从而来影响具体的转换行为。当然我们还可以使用其他的转换方式，比如转换成xml等。
