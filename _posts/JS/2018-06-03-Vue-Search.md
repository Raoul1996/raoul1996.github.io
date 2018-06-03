---
latout: post
title: 基于正则的前端数据筛选功能实现
category: JavaScript
keyword: RegExp filter
---

### TL;DR
[gist](https://gist.github.com/Raoul1996/3ad5466414276315c6359c39df8ec447)
<script src="https://gist.github.com/Raoul1996/3ad5466414276315c6359c39df8ec447.js"></script>

### 核心

```shell
keywords(val) {
        if (val) {
          // eg. '(' => '\(','+' => '\+'
          val = `${val}`.replace(/([.?*+^$[\]\\(){}|-])/g, '\\$1');
          let origin = this.search;
          let reg = new RegExp(`${val}`);
          if (this.keywords && origin && Array.isArray(origin)) {
            this.searchItem = origin.filter(item => reg.test(item.name));
          } else {
            this.searchItem = this.search;
          }
        } else {
          this.searchItem = this.search;
        }
```
