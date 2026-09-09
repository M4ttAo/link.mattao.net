---
layout: default
title: "MattAo"
description: "Links, projects & stuff."
---

<div class="index-layout">
  <header class="intro">
    <h1>{{ site.data.profile.name }}</h1>
    <p>{{ site.data.profile.bio }}</p>
    <span class="intro-line" aria-hidden="true"></span>
  </header>

  <div class="links-grid">
    {% for group in site.data.links.links %}
      {% assign category_name = group.category | default: "Tools" %}
      {% assign category_links = group.items | default: group.links %}
      <section class="category-panel category-panel-{{ forloop.index }}">
        <div class="category-heading">
          <span class="category-index">0{{ forloop.index }}</span>
          <h2>{{ category_name }}</h2>
          <span class="category-count">{{ category_links.size | prepend: "0" | slice: -2, 2 }}</span>
        </div>
        <div class="link-list">
          {% for link in category_links %}
            {% include link-card.html link=link %}
          {% endfor %}
        </div>
      </section>
    {% endfor %}

    {% include color-tool.html %}
    {% include sipcalc.html %}
    {% include f1-widget.html %}
  </div>
</div>
