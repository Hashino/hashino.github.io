---
layout: home
title: "{{ site.title }}"
---

<div class="post-list">
{% for post in site.posts %}
  <article class="post-preview">
    <div class="blog-content">
      <h2><a href="{{ post.url }}">{{ post.title }}</a></h2>
      <p class="post-date">{{ post.date | date: "%B %d, %Y" }}</p>
      <div class="post-content">
        {{ post.content }}
      </div>
    </div>
  </article>
{% endfor %}
</div>
