---
layout: default
title: "MattAo"
description: "Links, projects & stuff."
---

<div class="index-layout">
  <header class="intro">
    <div class="brand-lockup">
      <span class="brand-symbol" aria-hidden="true">M</span>
      <span class="brand-label">{{ site.data.profile.eyebrow }}</span>
    </div>
    <h1>{{ site.data.profile.name }}</h1>
    <p>{{ site.data.profile.bio }}</p>
    <span class="intro-line" aria-hidden="true"></span>
  </header>

  <div class="links-grid">
    {% assign category_groups = site.data.links.links | group_by: "category" %}
    {% for group in category_groups %}
      {% assign category_name = group.name | default: "Tools" %}
      <section class="category-panel category-panel-{{ forloop.index }}">
        <div class="category-heading">
          <span class="category-index">0{{ forloop.index }}</span>
          <h2>{{ category_name }}</h2>
          <span class="category-count">{{ group.items.size | prepend: "0" | slice: -2, 2 }}</span>
        </div>
        <div class="link-list">
          {% for link in group.items %}
            {% include link-card.html link=link %}
          {% endfor %}
        </div>
      </section>
    {% endfor %}
  </div>
</div>
