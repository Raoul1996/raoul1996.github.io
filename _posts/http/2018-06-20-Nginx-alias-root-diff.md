---
layout: post
title: Nginx 中 root 和 alias 的区别
category: Http
keywords: nginx location root alias
---

### 高频考点

昨天在和 mentor 聊天的时候，谈到了这个问题，因为不知道，遂花时间测试了一下。
### Nginx 配置文件

```lua
server {
  listen 80;
  server_name localhost;

  location /test/ {
    root /usr/share/nginx/html;
    index index.html index.htm index.php;
  }
}
```

```lua
server {
  listen 80;
  server_name localhost;

  location /test/ {
    alias /usr/share/nginx/html/test/;
    index index.html index.htm index.php;
  }
}
```

上面两份配置的作用相同。

```shell
# 启动一个 nginx 镜像
docker run -it -d -p 80:80 --name nginx nginx

# 连接 nginx 容器提供的伪终端
docker exec -it nginx bash

# 修改配置文件
cd /etc/nginx/conf.d/ && vim default.conf

# 保存后测试 nginx conf 文件
nginx -t

# 测试通过后重新加载 nginx.conf
service nginx reload
```
nginx 配置文件是 `/etc/nginx/` 下的 `nginx.conf` 文件，感兴趣可以自行查看

```shell
docker exec -it nginx bash
cd /usr/share/html && mkdir test
# 编辑文件
vim test.html
```

当访问 [http://localhost/test/test.html](http://locahost/test/test.html) 时，Nginx 会按照配置文件去 `usr/share/nginx/html/test/` 下寻找 `test.html` 并返回。

### 总结

1. alias 的值为 root + location 匹配到的值, root 是最上层目录的定义，alias 则是目录别名。
2. alias 必须使用 `/` 结尾， root 则不必要
3. root 可以不位于 location 块中，alias 必须位于 location 块中。
