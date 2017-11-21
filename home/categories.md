---
layout: page
title: "博文分类"
categories: home
permalink: /home/categories.html
header: Posts By Category
group: navigation
---

<div class="col-sm-3 col-xs-7">
    <ul class="nav nav-tabs-vertical">
      {% assign categories_list = site.categories %}
      {% if categories_list.first[0] == null %}
        {% for category in categories_list %}
            <li>
                <a href="{{ site.BASE_PATH }}/{{ site.categories_path }}#{{ category | replace:' ','-' }}-ref" data-toggle="tab">
                  {{ category | capitalize }} <span class="badge pull-right">{{ site.categories[category].size }}</span>
               </a>
            </li>
        {% endfor %}
      {% else %}
        {% for category in categories_list %}
            <li>
                <a href="{{ site.BASE_PATH }}/{{ site.categories_path }}#{{ category[0] | replace:' ','-' }}-ref" data-toggle="tab">
                    {{ category[0] | capitalize }} <span class="badge pull-right">{{ category[1].size }}</span>
                </a>
            </li>
        {% endfor %}
      {% endif %}
      {% assign categories_list = nil %}
    </ul>
</div>
<!-- Tab panes -->
<div class="tab-content col-sm-9 col-xs-6">
  {% for category in site.categories %}
    <div class="tab-pane" id="{{ category[0] | replace:' ','-' }}-ref">
      <h3 style="margin-top: 0px">类别[{{ category[0] | capitalize }}]的所有博文：</h3>
      <ul class="list-unstyled">
        {% assign pages_list = category[1] %}
        {% for node in pages_list %}
          {% if node.title != null %}
            {% if group == null or group == node.group %}
              <hr>
              <li style="line-height: 35px;"><a href="{{ site.BASE_PATH }}{{node.url}}"><span style="font-size:20px;"><b>{{node.title}}</b></span></a> <span class="text-muted">- {{ node.date | date: "%B %d, %Y" }}</span></li>
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
            {% endif %}
          {% endif %}
        {% endfor %}
        {% assign pages_list = nil %}
      </ul>
    </div>
  {% endfor %}
</div>

<div class="clearfix"></div>
