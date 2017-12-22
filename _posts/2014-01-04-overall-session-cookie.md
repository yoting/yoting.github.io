---
layout: post
title: Session和Cookie的使用
date: 2017-10-14
categories: "Overall"
tags: session cookie
---

&ensp;&ensp;&ensp;&ensp;会话（Session）跟踪是Web程序中常用的技术，用来跟踪用户的整个会话。常用的会话跟踪技术是Cookie与Session。Cookie通过在客户端记录信息确定用户身份，Session通过在服务器端记录信息确定用户身份。

- 创建HttpSession
    - Servlet中，通过HttpServletRequest的getSession（）方法获取或者创建，如果获取到HttpSession，就直接返回获取的HttpSession。如果没获取到，就新建一个HttpSession返回。还可以在getSession（Boolean create）传递参数来获取session，默认是传true，传false区别是如果没有session，不会创建而是直接返回null。
    - Jsp页面中，默认会调运request的getSession方法，如果需要禁用，可以通过<%@ page session="false" %>关闭。

&ensp;&ensp;&ensp;&ensp;Servlet中获取和处理session代码：

```java
protected void doGet(HttpServletRequest request, HttpServletResponse response)
      throws ServletException, IOException {
   // 模拟这种场景
   response.setCharacterEncoding("UTF-8");
   response.setContentType("text/html;chatset=UTF-8");
   PrintWriter out = response.getWriter();

   //session获取和设置属性
   HttpSession session = request.getSession();
   session.setAttribute("attr1","vaule1");
   session.getAttribute("attr1");
   String sessionId = session.getId();

   // 对url进行编码
   String url1 = response.encodeURL("/demoServlet1");
   String url2 = "demoServlet2";
   out.print("<a href='" + url1 + "'>link1</a>     ");
   out.print("<a href='" + url2 + "'>link2</a>");
}
```

- Cookie的读取和写入

&ensp;&ensp;&ensp;&ensp;通过Java程序写入和读取Cookie代码：

```java
/**
 * 获取cookie
 * @param request
 * @param name
 * @return
 */
public static String readCookie(HttpServletRequest request, String name) {
    Cookie cookies[] = request.getCookies();
    if(cookies != null) {
        for (Cookie cookie : cookies) {
            if(cookie.getName().equals(name)) {
                return cookie.getValue();
            }
        }
    }
    return null;
}

/**
 * 写入cookie
 * @param response
 * @param name
 * @param value
 */
public static void writeCookie(HttpServletResponse response, String name, String value, int expireDay) {
    Cookie cookie = new Cookie(name, value);
    cookie.setPath("/");
    cookie.setMaxAge(60 * 60 * 24 * expireDay);
    response.addCookie(cookie);
}
```

&ensp;&ensp;&ensp;&ensp;需要注意的是，读取Cookie是从request中，写入则是写到resposne中，其实都是分别在request和response的header中添加属性。另外Cookie还有一些其他属性可以设置。比如setDomain，setSecure等。设置secure其实就是设置HttpOnly属性，在支持HttpOnly cookies的浏览器中（IE6+，FF3.0+），如果在Cookie中设置了"HttpOnly"属性，那么通过JavaScript脚本将无法读取到Cookie信息，这样能有效的防止XSS攻击，让网站应用更加安全。

- HttpSession和Cookie配合
    - 当新建一个HttpSession之后，HttpServletResponse会将sessionId（jsessionid）写到Cookie中，下次浏览器再请求时候，会将之前Cookie中的jsessionid放在下一个request的header中。这样服务端再调运request.getSession()的时候就可以拿到sessinId（jsessionid）从而确定是哪个客户端请求。
    - 如果浏览器关闭了Cookie功能或者不支持Cookei，可以通过将sessionId写在Url中传递，这样同样服务端在下次接收到请求后，也能拿到sessionId从而确定是哪个客户端请求。如果使用这样方式，需要再response返回的时候，将url通过response.encodeURL("url")处理一下。
    - 如果浏览器关闭了Cookie，也没有通过Url传递，那么每次请求都会新建一个sessino导致每次都是新的session。当然也就不能获取到session中的属性。
