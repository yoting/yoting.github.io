---
layout: page
title: "标签分类"
categories: home
permalink: /home/tags.html
header: Posts By Tag
group: navigation
---

{% capture site_tags %}{% for tag in site.tags %}{{ tag | first }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
{% assign tag_words = site_tags | split:',' | sort %}


<div class="col-sm-3 col-xs-6">
    <ul class="nav nav-tabs-vertical">
    {% for item in (0..site.tags.size) %}{% unless forloop.last %}
      {% capture this_word %}{{ tag_words[item] | strip_newlines }}{% endcapture %}
      <li>
          <a href="#{{ this_word | replace:' ','-' }}-ref" data-toggle="tab">
            {{ this_word }}<span class="badge pull-right">{{ site.tags[this_word].size }}</span>
         </a>
      </li>
   {% endunless %}{% endfor %}
   </ul>
</div>
<!-- Tab panes -->
<div class="tab-content col-sm-9 col-xs-6">
  {% for item in (0..site.tags.size) %}{% unless forloop.last %}
    {% capture this_word %}{{ tag_words[item] | strip_newlines }}{% endcapture %}
    <div class="tab-pane" id="{{ this_word | replace:' ','-' }}-ref">
      <h2 style="margin-top: 0px">标签[{{ this_word }}]的所有博文：</h2>
      <ul class="list-unstyled">
        {% for post in site.tags[this_word] %}{% if post.title != null %}
          <hr>
          <li style="line-height: 35px;"><a href="{{ site.BASE_PATH }}{{post.url}}"><span style="font-size:20px;"><b>{{post.title}}</b></span></a> <span class="text-muted">- {{ post.date | date: "%B %d, %Y" }}</span></li>
          <!--
          <div>
		    {% if node.fullview %}
		    {{ node.content }}
		    {% else %}
		    {% if node.shortinfo %}
		    {{ node.shortinfo }}
		    {% elsif node.description %}
		    {{ node.description }}
		    {% else %}
		    {{ node.excerpt }}
		    {% endif %}
		    {% endif %}
		  </div>
		  -->
        {% endif %}{% endfor %}
      </ul>
    </div>
  {% endunless %}{% endfor %}
</div>

<div class="clearfix"></div>
