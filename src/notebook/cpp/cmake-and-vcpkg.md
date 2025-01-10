# cmake and vcpkg

## 安装vcpkg，替换国内源

```bash
git clone https://github.com/microsoft/vcpkg.git

cd vcpkg/scripts
# sed -i 's#https://github.com/#https://mirror.ghproxy.com/https://github.com/#g' `grep -rl "https://github.com/" ./`
# cd ..

./bootstrap-vcpkg.sh -disableMetrics

# cd ports
# sed -i 's#https://github.com/#https://mirror.ghproxy.com/https://github.com/#g' `grep -rl "https://github.com/" ./`
# sed -i 's#https://ftp.gnu.org/#https://mirrors.aliyun.com/#g' `grep -rl "https://ftp.gnu.org/" ./`
# sed -i 's#http://ftp.gnu.org/pub/gnu/#https://mirrors.aliyun.com/gnu/#g' `grep -rl "http://ftp.gnu.org/pub/gnu" ./`

export VCPKG_HOME=/usr/local/vcpkg
export PATH=$VCPKG_HOME:$PATH

```

## demo

vcpkg new --application