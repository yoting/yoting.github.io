---
layout: post
title: Websocket介绍和简单使用
date: 2017-11-19
categories: frame
tags: websocket
---

### **网络传输的几个概念和方式**：

- **HTTP短连接**：在HTTP1.0中，客户端发送请求，服务器接收请求，双方建立连接，服务器响应资源，请求结束。
- **HTTP长连接**：在HTTP 1.1，客户端发出请求，服务端接收请求，双方建立连接，在服务端没有返回之前保持连接，当客户端再发送请求时，它会使用同一个连接。这一直继续到客户端或服务器端认为会话已经结束，其中一方中断连接。
- **非阻塞轮询**：客户端以固定的频率（比如10秒钟一次）向服务端发送请求，如果服务端没有数据响应，就直接响应一个空，如果有数据响应，就将响应数据作为结果返回给客户端。特点是每次请求后，都会立即给响应。
- **阻塞长轮询**：客户端像传统轮询一样从服务器请求数据。如果服务器没有可以立即返回给客户端的数据，则不会立刻返回一个空结果，而是保持这个请求等待数据到来（请求阻塞或者超时），等有响应数据之后将数据作为结果返回给客户端。特点是一次请求后直到有响应数据时才会给返回，否则阻塞等待。
- **websocket**：客户端发送一次http websocket请求，服务器响应请求，双方建立持久连接，并进行双向数据传输，后面不再进行HTTP连接，而是使用TCP连接，双方都可以随时通过TCP连接像对方发送数据。

### **简单使用websocket示例**：
&ensp;&ensp;&ensp;&ensp;通过简单示例，从客户端像服务端发起一个websocket连接，然后服务端收到连接后向客户端发送消息，客户端收到消息后再向服务端发送消息。示例代码如下：（另外需要注意对环境有要求）

- **客户端请求发起websocket连接**，使用简单js发起连接
```html
<!DOCTYPE html>
<html>
    <head>
        <title>Demo Websockets</title>
    </head>
    <body>
         <div>
          <input type="submit" value="Start" onclick="start()" />
         </div>
         <div id="messages"></div>
         <script type="text/javascript">
          var webSocket = new WebSocket('ws://localhost:8080/demo');
          
          webSocket.onerror = function(event) {
           onError(event)
          };
          
          webSocket.onopen = function(event) {
           onOpen(event)
          };
           
          webSocket.onclose = function(event) {
           onClose(event)
          };
          
          webSocket.onmessage = function(event) {
           onMessage(event)
          };
          
          function onMessage(event) {
           document.getElementById('messages').innerHTML
            += '<br />' + event.data;
          }
          
          function onOpen(event) {
           document.getElementById('messages').innerHTML
            = 'Connection established';
          }
           
          function onClose(event) {
           document.getElementById('messages').innerHTML
            += '<br />disconnection';
          }
          
          function onError(event) {
           alert(event.data);
          }
          
          function start() {
           webSocket.send('hello');
           return false;
          }
         </script>
    </body>
</html>
```
- **服务端接收websocket**

&ensp;&ensp;&ensp;&ensp;依赖的pom文件：这些依赖配置的scope都是provided，只在编译的时候需要，在运行时候，web容器（tomcat）中本来就有这些包，但是需要注意编译时候使用的jar包和最后运行时使用的web容器中的jar包版本是兼容的才行。
```xml
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-catalina</artifactId>
    <version>7.0.47</version>
    <scope>provided</scope>
</dependency>
<dependency>
    <groupId>org.apache.tomcat</groupId>
    <artifactId>tomcat-coyote</artifactId>
    <version>7.0.47</version>
    <scope>provided</scope>
</dependency>
```
&ensp;&ensp;&ensp;&ensp;服务端接收请求的servelt:该servlet继承抽象类WebSocketServlet，只需要实现该抽象类的createWebSocketInbound方法。请求到达对应的servlet后，其实还是执行父类的doGet方法，在doGet方法中再调运了该方法生成一个websocket连接。注意该方法在tomcat的不同版本实现由变化。
```java
import org.apache.catalina.websocket.StreamInbound;
import org.apache.catalina.websocket.WebSocketServlet;

import javax.servlet.http.HttpServletRequest;

public class DemoWebSocketServlet extends WebSocketServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected StreamInbound createWebSocketInbound(String subProtocol,HttpServletRequest request) {
        DemoWebSocketInbound newClientConn = new DemoWebSocketInbound();
        return newClientConn;
    }
}
```
&ensp;&ensp;&ensp;&ensp;服务端处理websocket连接和消息的：该对象是真真处理websocket客户端消息的对象，可以处理各种消息对象，比如建立连接，关闭联系，消息等。
```java
//该类可以作为上面接收请求servlet私有内部类
import org.apache.catalina.websocket.MessageInbound;
import org.apache.catalina.websocket.WsOutbound;

import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.CharBuffer;
import java.util.ArrayList;
import java.util.List;

public class DemoWebSocketInbound extends MessageInbound {
    private static List<DemoWebSocketInbound> mmiList = new ArrayList<DemoWebSocketInbound>();
    private WsOutbound myoutbound;

    @Override
    public void onOpen(WsOutbound outbound) {
        try {
            System.out.println("Open Client.");
            this.myoutbound = outbound;
            mmiList.add(this);
            outbound.writeTextMessage(CharBuffer.wrap("Welcome!"));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void onClose(int status) {
        System.out.println("Close Client.");
        mmiList.remove(this);
    }

    @Override
    public void onTextMessage(CharBuffer cb) throws IOException {
        System.out.println("Accept Message : " + cb);
        for (DemoWebSocketInbound mmib : mmiList) {
            CharBuffer buffer = CharBuffer.wrap(cb);
            mmib.myoutbound.writeTextMessage(buffer);
            mmib.myoutbound.flush();
        }
    }

    @Override
    public void onBinaryMessage(ByteBuffer bb) throws IOException {
    }

    @Override
    public int getReadTimeout() {
        return 0;
    }
}
```
&ensp;&ensp;&ensp;&ensp;配置servlet映射路径，在web.xml中加入配置。当然servlet3.0开始可以直接使用@Servlet注解定义servlet，实质上和在wem.xml中配置原理和效果是相同的。
```xml
    <servlet>
        <servlet-name>aaaServlet</servlet-name>
        <servlet-class>com.gusi.demo.websocket.simple.DemoWebSocketServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>aaaServlet</servlet-name>
        <url-pattern>/aaa</url-pattern>
    </servlet-mapping>
```

- **通过注解方式发起连接和处理连接**

&ensp;&ensp;&ensp;&ensp;依赖的pom文件：
```xml
<dependency>
    <groupId>javax.websocket</groupId>
    <artifactId>javax.websocket-api</artifactId>
    <version>1.0</version>
    <scope>provided</scope>
</dependency>
```

&ensp;&ensp;&ensp;&ensp;服务端：服务端主要使用@ServerEndpoint注解
```java
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;
import java.io.IOException;
import java.util.concurrent.CopyOnWriteArraySet;

@ServerEndpoint("/bbb")
public class DemoWebSocketEndPoint {

    //静态变量，用来记录当前在线连接数。应该把它设计成线程安全的。
    private static int onlineCount = 0;

    //concurrent包的线程安全Set，用来存放每个客户端对应的MyWebSocket对象。若要实现服务端与单一客户端通信的话，可以使用Map来存放，其中Key可以为用户标识
    private static CopyOnWriteArraySet<DemoWebSocketEndPoint> webSocketSet = new CopyOnWriteArraySet<DemoWebSocketEndPoint>();

    //与某个客户端的连接会话，需要通过它来给客户端发送数据
    private Session session;

    /**
     * 连接建立成功调用的方法
     *
     * @param session 可选的参数。session为与某个客户端的连接会话，需要通过它来给客户端发送数据
     */
    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        webSocketSet.add(this);     //加入set中
        addOnlineCount();           //在线数加1
        sendMessage("Welcome!");
        System.out.println("有新连接加入！当前在线人数为" + getOnlineCount());
    }

    /**
     * 连接关闭调用的方法
     */
    @OnClose
    public void onClose() {
        webSocketSet.remove(this);  //从set中删除
        subOnlineCount();              //在线数减1
        System.out.println("有一连接关闭！当前在线人数为" + getOnlineCount());
    }

    /**
     * 收到客户端消息后调用的方法
     *
     * @param message 客户端发送过来的消息
     */
    @OnMessage
    public void onMessage(String message) {
        System.out.println("来自客户端的消息:" + message);
        //群发消息
        for (DemoWebSocketEndPoint item : webSocketSet) {
            item.sendMessage(message);
        }
    }

    /**
     * 发生错误时调用
     *
     * @param session
     * @param error
     */
    @OnError
    public void onError(Session session, Throwable error) {
        System.out.println("发生错误");
        error.printStackTrace();
    }

    private void sendMessage(String message) {
        try {
            this.session.getBasicRemote().sendText(message);
            //this.session.getAsyncRemote().sendText(message);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public static synchronized int getOnlineCount() {
        return onlineCount;
    }

    public static synchronized void addOnlineCount() {
        DemoWebSocketEndPoint.onlineCount++;
    }

    public static synchronized void subOnlineCount() {
        DemoWebSocketEndPoint.onlineCount--;
    }
}

```

&ensp;&ensp;&ensp;&ensp;客户端：客户端主要使用@ClientEndpoint注解。使用了glassfish的ClientManager工具，需要导入相关的jar包。

```java
import org.glassfish.tyrus.client.ClientManager;

import javax.websocket.ClientEndpoint;
import javax.websocket.CloseReason;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import java.net.URI;
import java.util.concurrent.CountDownLatch;

@ClientEndpoint
public class DemoClientEndPoint {
    private static CountDownLatch latch;
    private Session session;

    @OnOpen
    public void onOpen(Session session) {
        this.session = session;
        System.out.println("websocket opening.");
    }

    @OnMessage
    public void onMessage(String message) {
        System.out.println("receive message：" + message);
    }

    @OnClose
    public void onClose(Session session, CloseReason closeReason) {
        this.session = null;
        latch.countDown();
    }

    //测试连接
    public static void main(String[] args) {
        latch = new CountDownLatch(1);
        ClientManager client = ClientManager.createClient();
        try {
            Session session = client.connectToServer(DemoClientEndPoint.class,
                    new URI("ws://localhost:8080/demoWebsocket/bbb"));

            for (int i = 0; i < 10; i++) {
                session.getBasicRemote().sendText("message " + String.valueOf(i));
            }
            latch.await();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
```

- **服务端处理通过spring集成方式**

&ensp;&ensp;&ensp;&ensp;导入相关的jar包：(除spring基础包，还需要spring-websocket和spring-messaging)
```xml
 <dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-core</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-beans</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-context</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-websocket</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-messaging</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-web</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>4.2.5.RELEASE</version>
</dependency>
```

&ensp;&ensp;&ensp;&ensp;定义一个拦截器，处理发起websocket消息之前的握手
```java
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.Map;

/**
 * 拦截器中处理http的握手，注册websocket服务接口
 */
public class HandshakeInterceptor extends HttpSessionHandshakeInterceptor {

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Exception ex) {
        System.out.println("After Handshake");
        super.afterHandshake(request, response, wsHandler, ex);
    }

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response, WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        System.out.println("Before Handshake");
        return super.beforeHandshake(request, response, wsHandler, attributes);
    }
}
```
&ensp;&ensp;&ensp;&ensp;定义一个websocket消息事件处理类，用于处理消息接收以及连接开启关闭等。
```java
import java.util.concurrent.TimeUnit;

import org.springframework.web.socket.BinaryMessage;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.PongMessage;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.AbstractWebSocketHandler;


/**
 * websocket事件处理器类
 */
public class DemoWebsocketHandler extends AbstractWebSocketHandler {
    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        super.afterConnectionEstablished(session);
        session.sendMessage(new TextMessage("Welcome!"));
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        super.handleMessage(session, message);
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        // super.handleTextMessage(session, message);
        System.out.println("receive message :" + message.getPayload());
        TimeUnit.SECONDS.sleep(10);
        session.sendMessage(new TextMessage("World!"));
    }

    @Override
    protected void handleBinaryMessage(WebSocketSession session, BinaryMessage message) throws Exception {
        super.handleBinaryMessage(session, message);
    }

    @Override
    protected void handlePongMessage(WebSocketSession session, PongMessage message) throws Exception {
        super.handlePongMessage(session, message);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {
        super.handleTransportError(session, exception);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        super.afterConnectionClosed(session, status);
    }
}
```

&ensp;&ensp;&ensp;&ensp;配置spring的xml文件，用于定义websocket的处理器类和websocket连接地址的映射关系。
```xml
<?xml version="1.0" encoding="UTF-8"?>
<beans xmlns="http://www.springframework.org/schema/beans"
       xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
       xmlns:mvc="http://www.springframework.org/schema/mvc"
       xmlns:websocket="http://www.springframework.org/schema/websocket"
       xsi:schemaLocation="http://www.springframework.org/schema/beans
        http://www.springframework.org/schema/beans/spring-beans.xsd
        http://www.springframework.org/schema/mvc
        http://www.springframework.org/schema/mvc/spring-mvc.xsd
        http://www.springframework.org/schema/websocket
        http://www.springframework.org/schema/websocket/spring-websocket.xsd">
    <mvc:annotation-driven/>

    <bean id="demoHandler" class="com.gusi.demo.websocket.spring.DemoWebsocketHandler"></bean>

    <websocket:handlers>
        <websocket:mapping path="/demo" handler="demoHandler"/>
        <websocket:handshake-interceptors>
            <bean class="com.gusi.demo.websocket.spring.HandshakeInterceptor"></bean>
        </websocket:handshake-interceptors>
    </websocket:handlers>

    <!--兼容低版本浏览器-->
    <!--<websocket:handlers>-->
    <!--<websocket:mapping handler="demoHandler" path="/js/demo"/>-->
    <!--<websocket:handshake-interceptors>-->
    <!--<bean class="com.gusi.demo.websocket.spring.HandshakeInterceptor"></bean>-->
    <!--</websocket:handshake-interceptors>-->
    <!--<websocket:sockjs/>-->
    <!--</websocket:handlers>-->
</beans>
```
&ensp;&ensp;&ensp;&ensp;配置springMvc的跳转，因为在建立websocket通道之前需要通过http接口握手后，才能开辟websocket通道。
```xml
<!--加载springmvc容器-->
<servlet>
    <servlet-name>spring-websocket</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath*:application.xml</param-value>
    </init-param>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>spring-websocket</servlet-name>
    <url-pattern>/</url-pattern>
</servlet-mapping>
```
&ensp;&ensp;&ensp;&ensp;以上就是对websocket的简单使用，通过客户端发起websocket连接，到互相发送消息。如果直接用websocket编写web应用，类似与直接使用tcp套接字，这样的效率很低。 STOMP 相当于基于websocket之上的一个高层级的线路协议，我们可以使用STOMP协议进行消息的交换，具体做法示例下一篇文章介绍和尝试！


