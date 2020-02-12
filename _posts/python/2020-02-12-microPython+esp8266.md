---
layout: post
category: Embedded
title: microPython + ESP8266 初体验
keywords: microPython ESP8266 ESP32 Embeded
---
### 开发环境介绍

今天的主角长这样：

![esp8266](https://initial-1252263807.cos.ap-beijing.myqcloud.com/esp8266.jpeg)

淘宝 10 块钱。

懒得在自己的机器上装各种包，又给它找了个跳板机，长这样

![raspberry](https://initial-1252263807.cos.ap-beijing.myqcloud.com/raspberry.jpeg)

这个稍贵。不过是当时毕业前忽悠老师要到的，不要钱。装个 Linux 系统之后，直接 ssh 上去就好使。拿 vim 凑合写几行语句应该也行了。

但是发现不在家的时候，掏出电脑来想玩一会儿没办法，所以花了点时间搞一搞内网穿透也是很有必要的：

[使用FRP做内网穿透](https://raoul1996.github.io/2018/11/04/NAT-traversal.html)。需要有云服务器。当时我买的时候刚好毕业，和毕设老师要钱买了两年的云服务器。

不会写C、C++。所以给 esp8266 找了个 microPython 的固件，搞一搞直接写 Python 岂不是美哉？（如果会写 C 的话，可以试试 AliOS Things）

[固件这里下载: esp8266](http://micropython.org/download#esp8266)，[具体的文档看这里](https://docs.micropython.org/en/latest/esp8266/quickref.html)

在 REPL 中写语句，测试方便，但是保存下来非常不方便。自己调试还好，正式写点东西是不成的。官方提供了 WebREPL，可以支持上传文件的那种：

[WebREPL Github Repo 点这里](https://github.com/micropython/webrepl)，不管下载到本地还是跳板机都是可以的。使用 `webrepl.py` 可以完成板子和跳板机（本地）的同步。

跳板机上还需要安装一个 `esptool`，用来刷固件进去。当然跳板机和 esp8266 之间还需要一条 microUSB 线进行连接（我买的esp8266自带了 USB2UART 芯片——CP2102）。
 
```bash
# install esptool
pip install esptool
# download bin file
wget http://micropython.org/resources/firmware/esp8266-20191220-v1.12.bin
```

手头还需要一个开发机，mac、linux 都可以（只要能打开 terminal，有网络即可），或者直接用 raspberry，不过条件不至于这么艰苦才是。

因为跳板机（raspberry）资源比较有限，所以我没有安装 `virtulenv`，如果机器资源比较富裕，推荐使用 venv 环境，并且配合 zsh 的 autoenv 插件，效率提升很明显。

### Write Flash

esp8266 厂家提供了固件，奈何我不会写 `C` 。所以这里就直接先清除掉原有的固件，刷入支持 microPython 的固件

```bash
# erase flash
esptool.py --port /dev/ttyUSB0 erase_flash 

# write new flash
esptool.py --port /dev/ttyUSB0 --baud 460800 write_flash --flash_size=detect -fm dio 0 esp8266-20191220-v1.12.bin
```
其中 `/dev/tty*` 是 esp8266 对应的 port，这个看机器不同而不同。一般是 `/dev/ttyUSB0`(raspberry)或者 `/dev/cu.SLAB_USBtoUART`(mac)。Windows 一般是 COM\*。开发嵌入式的一般都推荐用 Window 做主力机，**可是我不喜欢 Windows。**

亲测 `-fm dio` 需要加上，具体原因在官方文档中有说明：

*For some boards with a particular FlashROM configuration (e.g. some variants of a NodeMCU board) you may need to use the following command to deploy the firmware (note the -fm dio option)*

这样固件就刷好了。

### WIFI Connection

可以说如果没有网络，ESP8266 就没啥可玩的了。

刷完 microPython 的固件之后，需要按一下 `RST` 键。然后可以通过 `screen` 连接进入 microPython REPL（需要接着 USB 线）

```bash
# attach raspberry
ssh -i ~/.ssh/id_rpi -oPort=9434 pi@192.168.1.2

# attach microPython REPL
screen /dev/ttyUSB0 115200
```
然后进入 microPythonREPL

```
MicroPython v1.12 on 2019-12-20; ESP module with ESP8266
Type "help()" for more information.
>>> 
```
开启 webREPL，然后就可以上传文件到板子上了

```
>>> import webrepl_setup
```

按照提示说明做就行。不出意外，你已经成功打开 WebREPL，并且设置好密码了。

```
WebREPL daemon started on ws://192.168.4.1:8266
Started webrepl in normal mode
```

**接下来请保证和 Esp8266 在同一个局域网下~**。如果有跳板机存在，则只需要跳板机和 esp8266在同一个局域网，本机能访问通跳板机即可。

板子自己会创建一个 WIFI，名称是 *MicroPython-xxxxxx*，密码是 *micropythonN*

接下来将下面仓库 `clone` 到跳板机或者本地

```
git clone git@github.com:micropython/webrepl.git
```
然后在本地创建文件 `boot.py`。这个文件会在板子开始工作之后自动执行。

```python
# -*- coding:utf-8 -*-
# 2020-02-13
# https://docs.micropython.org/en/latest/esp8266/quickref.html#networking

import network

def init_wifi_conn(wlan, ssid, pwd):
    wlan.active(True)
    wlan.connect(ssid, pwd)
    while not wlan.isconnected():
        pass
    print("network config:", wlan.ifconfig())


def do_connection():
    sta_if = network.WLAN(network.STA_IF)
    
    # remember modify ssid and pwd.
    ssid = "your_wifi_ssid"
    pwd = "your_wifi_pwd"
    
    if not sta_if.isconnected():
        init_wifi_conn(sta_if, ssid, pwd)


if __name__ == '__main__':
    import webrepl
    do_connection()
    webrepl.start()

```
然后在跳板机执行，将本地文件 push 到 esp8266：

```bash
# cd webrepl

./webrepl_cli.py -p 1234 boot.py  192.168.4.1:/boot.py 
```
然后按住板子 reset 按钮，再次通过 `screen` 进入 microPython REPL 查看，发现 webREPL 多了一个地址，例如下图：

```
WebREPL daemon started on ws://192.168.4.1:8266
WebREPL daemon started on ws://192.168.1.2:8266
Started webrepl in normal mode
```
下面的 `192.168.1.2` 就是路由器分配给 Esp8266 的 IP 地址。

WebREPL也可以使用 web 版本，如下：

```bash
# cd webrepl

python3 -m http.server

```
随后，本地浏览器访问 `http://{跳板机IP}:8000/webrepl.html`，同样可以连接 esp8266


### GPIO
![esp8266 gpio](https://initial-1252263807.cos.ap-beijing.myqcloud.com/esp8266_gpio.jpg)

WIP

### mqtt

WIP

### Timer

WIP

