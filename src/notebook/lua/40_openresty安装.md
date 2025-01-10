# 1. openresty安装

## 1.1. 以fedora 29为例

```bash
yum install pcre-devel openssl-devel gcc curl

wget https://openresty.org/download/openresty-1.13.6.2.tar.gz

tar -xzvf openresty-1.13.6.2.tar.gz

cd openresty-1.13.6.2

./configure

make

sudo make install
```

```bash
sudo dnf install 'dnf-command(copr)'
sudo dnf copr enable openresty/openresty
```

## 1.2. ubuntu 18.04下安装openresty

```bash
# 安装相关依赖包
sudo apt install libpcre3-dev openssl libssl-dev ruby zlib1g zlib1g.dev -y

# 下载源码
wget https://openresty.org/download/openresty-1.13.6.2.tar.gz
# wget https://openresty.org/download/openresty-1.15.8.2.tar.gz
# 解压、配置、编译、安装：
tar xzvf openresty-1.13.6.2.tar.gz
cd openresty-1.13.6.2/
./configure
make
sudo make install
```

## 1.3. OpenResty "hello world"

创建以下目录

```bash
mkdir ~/work
cd ~/work
mkdir logs/ conf/
```

创建一个`conf/nginx.conf`文件

```conf
worker_processes  1;
error_log logs/error.log;
events {
    worker_connections 1024;
}
http {
    server {
        listen 8080;
        location / {
            default_type text/html;
            content_by_lua '
                ngx.say("<p>hello, world</p>")
            ';
        }
    }
}
```
