---
layout: post
title: Config NAT Traversal on Rasoberry-pi
category: rpi
keywords: rpi, NAT Traversal
---

**English isn't my native language, please excuse the typing error.**

### Install Ubuntu Mate @ 16.04

Download the [ubunutu mate image torrent](https://ubuntu-mate.org/raspberry-pi/ubuntu-mate-16.04.2-desktop-armhf-raspberry-pi.img.xz.torrent) for arm platform.

Download [SD card Formtter](https://www.sdcard.org/downloads/formatter_4/eula_mac/InstallSD_CardFormatter0500.mpkg)，unzip it, format the SD card.

Write the OS image to empty SD card via these command (more info can click [here](https://blog.csdn.net/qq_34594236/article/details/77815027))：

```bash
# unmount the disk
diskutil unmount /dev/disk2s1

# write img (must be carefully)
sudo dd bs=4m if=/path_to/ubuntu-mate-16.04.2-desktop-armhf-raspberry-pi.img of=/dev/disk2
```

Insert the SD card in raspberry-pi, power ups. Then insert the keyword, mouse and screen. or search on google try to login wia ssh connection. it's very easy. (Notice: if you want to install ubuntu-meta, a screen is prerequisite. You should try to use the rpi official OS: raspbian, which is very like Debian)

Use `sudo apt update && sudo apt upgrade` to update the lib.

### SSH Startup Item

[More info can click here](http://shumeipai.nxez.com/2016/11/29/install-nas-on-ubuntu-mate.html)

```bash
sudo apt-get install openssh-server
sudo raspi-config
```

Select item `3`, and enable the SSH (only for rpi)

this operation should add the `sshd` service into the startup items. if you don't like use `raspi-config`, this command may also work (without test):

```bash
sudo systemctl enable sshd
sudo systemctl restart sshd
```

then, you can use `sudo systemctl status {service name}` to check the state of your service. `raspi-config` just some quickly settings, Linux OS is univers

### NET Travarsal

#### SSH

Seems the rpi don't have a public Internet Address, and I have a Virtual Private Srver on tencent cloud. So [NAT traversal](https://en.wikipedia.org/wiki/NAT_traversal) is a good solution:

There are some production about NAT traversal, like `ngrok`、`natapp` and etc. but the spped and delay are very bad. So I decide to use a open source solution: [`frp`](https://github.com/fatedier/frp)

Just use the simplest config is enough to run it. run `frps` (server side) on virtal private server, and the `frpc` (client side) on rpi.

On Server Side, just use `nohup` to wrapper the command, ensure the process will continue run after operator exit the ssh session.

On Client Side, We ensure the `frpc` will start Automaticly. After some experiment, I decide to use `systemcli` to acheve it.

Then use this command bellow to connect the rpi:

```bash
ssh -oPort=6000 rpi@x.x.x.x
```

haha, it's connected!

#### Http

you should have a domain for this part:

1. set your subdomain name resolution to your VPS, to redirect requests  to your `frps` service.
3. set the `sundomain` value in `frpc` configration file
4. set `local_port` value in `frpc` configration file, in order to visit `http://127.0.0.1:[local_port]`
5. config the http server on your VPS, in order to redirect requests to your `frps` service which visit the subdomain above.
6. visit the `http://subdomain.youdomain.com:[vhost_http_port]` to visit the `http://127.0.0.1:[local_port]` on your respberry.


### Frp:

#### Frpc (Client Side):

```bash
# download the frp release pkg
wget https://github.com/fatedier/frp/releases/download/v0.21.0/frp_0.21.0_linux_arm.tar.gz
tar xzf frp_0.21.0_linux_arm.tar.gz
cd frp_0.21.0_linux_arm

# move the binary and configuration file to current place
sudo mkdir -p /etc/frpc
sudo cp frpc /usr/local/sbin
sudo cp frpc.ini /etc/frpc

# create system service
sudo vim /etc/systemd/system/frpc.service
sudo systemctl start frpc

# register it to system startup item
sudo systemctl enable frpc
```

```ini
# /etc/systemd/system/frpc.service

Description=frpc daemon
After=network.target syslog.target
Wants=network.target

[Service]
Type=simple
ExecStart=/usr/local/sbin/frpc -c /etc/frpc/frpc.ini

[Install]
WantedBy=multi-user.target

```

server_addr should be your VPS public IP address

```ini
[common]
user = "your_name"
server_addr = x.x.x.x
server_port = 7000
log_file = /var/log/frp/frpc.log
log_level = info
log_max_days = 7
privilege_token = [token]
login_fail_exit = false

admin_addr = 0.0.0.0
admin_port = 7400
admin_user = admin
admin_pwd = admin

[web]
privilege_mode = true
type = http
local_port = 80
subdomain = frpc
pool_count = 10

[ssh]
privilege_mode = true
type = tcp
local_ip = 127.0.0.1
local_port = 22
remote_port = [port]
use_gzip = true
use_encryption = true
pool_count = 2

[range:VNC]
privilege_mode = true
type = tcp
local_ip = 127.0.0.1
local_port=5901-5903
remote_port= 55901-55903
```



also can view the full configuration file and the docs of frp repo.

```
# view the frpc service state
sudo systemctl status frpc
```

#### Frps (Server Side):

```bash
nohup frps -c ~/.frps.ini &
```

```bash
Veiw logs
tail -f nohup.out
```

frps configuration:

```
[common]
bind_port = 7000
vhost_http_port = [vhost_port]
subdomain_host = [domain]
dashboard_port = 7500
dashboard_user = [username]
dashboard_pwd = [password]
log_file = ./frps.log
log_level = info
log_max_days = 3
privilege_mode = true
privilege_token = [token]
max_pool_count = 50

```
Beacuse the request for `http://frpc.youdomain.com` will arrive your VPS's `80` port by default, If you run a `nginx` server or `apache` and etc. you should redirct these requests to `frps` serive. for example, `nginx` configuration file should like this:

```nginx
server {
  listen 80;
  server_name frpc.youdomain.com;
  location / {
    proxy_pass http://0.0.0.0:7000/;
  }

}
```
then reload the nginx config by these command:

```bash
sudo nginx -t
sudo nginx -s reload
```

Thanks for your reading.
