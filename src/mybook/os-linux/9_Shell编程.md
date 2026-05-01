# Shell 编程

## 1. Shell 基础

### 1.1 变量

```bash
name="hello"
echo $name
echo ${name}
echo ${#name}                      # 字符串长度

readonly PI=3.14
unset name

env                                # 查看环境变量
export MY_VAR="value"              # 导出环境变量
declare -i num=42                  # 整数变量
declare -r CONST="fixed"           # 只读变量
declare -a arr                     # 索引数组
declare -A map                     # 关联数组
```

### 1.2 特殊变量

| 变量 | 含义 |
|------|------|
| `$0` | 脚本名 |
| `$1`~`$9` | 位置参数 |
| `${10}` | 第10个及以后的参数 |
| `$#` | 参数个数 |
| `$@` | 所有参数（各自独立） |
| `$*` | 所有参数（作为一个整体） |
| `$?` | 上一命令退出码 |
| `$$` | 当前脚本PID |
| `$!` | 最近后台进程PID |
| `$_` | 上一命令最后一个参数 |

### 1.3 字符串操作

```bash
str="Hello World"
echo ${str:0:5}                    # Hello（子串）
echo ${str:6}                      # World
echo ${str:-default}               # 默认值
echo ${str:=default}               # 赋默认值
echo ${str:+replacement}           # 非空替换
echo ${str:?error message}         # 空则报错

echo ${str/World/Bash}             # 替换第一个
echo ${str//l/L}                   # 替换所有
echo ${str#Hello}                  # 删除前缀
echo ${str%World}                  # 删除后缀
echo ${str%% *}                    # 删除最长前缀匹配
echo ${str##* }                    # 删除最长后缀匹配
```

### 1.4 数组

```bash
arr=(one two three four)
echo ${arr[0]}                     # one
echo ${arr[@]}                     # 所有元素
echo ${#arr[@]}                    # 元素个数
echo ${#arr[1]}                    # 第二个元素长度
echo ${arr[@]:1:2}                 # 切片：two three
arr+=(five)                        # 追加
unset arr[2]                       # 删除元素

declare -A map
map[name]="Alice"
map[age]=30
echo ${map[name]}
echo ${!map[@]}                    # 所有键
echo ${map[@]}                     # 所有值
```

## 2. 条件判断

### 2.1 test / [ / [[

```bash
if [ -f /etc/passwd ]; then
    echo "file exists"
fi

if [[ -f /etc/passwd && -r /etc/passwd ]]; then
    echo "file exists and readable"
fi

# 字符串比较
[[ "$a" == "$b" ]]                 # 相等
[[ "$a" != "$b" ]]                 # 不等
[[ -z "$a" ]]                      # 空字符串
[[ -n "$a" ]]                      # 非空字符串
[[ "$a" < "$b" ]]                  # 字典序（仅[[支持）

# 数值比较
[[ $a -eq $b ]]                    # 等于
[[ $a -ne $b ]]                    # 不等于
[[ $a -gt $b ]]                    # 大于
[[ $a -ge $b ]]                    # 大于等于
[[ $a -lt $b ]]                    # 小于
[[ $a -le $b ]]                    # 小于等于

# 文件判断
[[ -f file ]]                      # 普通文件
[[ -d dir ]]                       # 目录
[[ -e path ]]                      # 存在
[[ -r file ]]                      # 可读
[[ -w file ]]                      # 可写
[[ -x file ]]                      # 可执行
[[ -s file ]]                      # 非空文件
[[ file1 -nt file2 ]]              # file1比file2新
[[ file1 -ot file2 ]]              # file1比file2旧
```

### 2.2 case

```bash
case "$1" in
    start)
        echo "Starting..."
        ;;
    stop)
        echo "Stopping..."
        ;;
    restart)
        echo "Restarting..."
        ;;
    status)
        echo "Status: running"
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
```

## 3. 循环

### 3.1 for

```bash
for i in 1 2 3 4 5; do
    echo $i
done

for i in {1..10}; do
    echo $i
done

for i in {1..10..2}; do            # 步长2
    echo $i
done

for ((i=0; i<10; i++)); do
    echo $i
done

for file in /etc/*.conf; do
    echo "$file"
done

for item in "${arr[@]}"; do
    echo "$item"
done
```

### 3.2 while / until

```bash
while read line; do
    echo "$line"
done < input.txt

count=0
while [[ $count -lt 10 ]]; do
    echo $count
    ((count++))
done

until [[ -f /tmp/done ]]; do
    sleep 1
done
echo "Done!"
```

### 3.3 select

```bash
select opt in "Install" "Update" "Remove" "Quit"; do
    case $opt in
        Install) echo "Installing...";;
        Update) echo "Updating...";;
        Remove) echo "Removing...";;
        Quit) break;;
        *) echo "Invalid option";;
    esac
done
```

## 4. 函数

```bash
greet() {
    local name="$1"
    echo "Hello, $name!"
}

greet "World"

add() {
    local a=$1
    local b=$2
    echo $((a + b))
}

result=$(add 3 4)
echo $result

return_code() {
    if [[ -f /etc/passwd ]]; then
        return 0
    else
        return 1
    fi
}

return_code
echo "Exit code: $?"
```

## 5. 文本处理三剑客

### 5.1 grep

```bash
grep "pattern" file.txt            # 基本搜索
grep -i "pattern" file.txt         # 忽略大小写
grep -v "pattern" file.txt         # 反向匹配
grep -r "pattern" /etc/            # 递归搜索
grep -n "pattern" file.txt         # 显示行号
grep -c "pattern" file.txt         # 匹配行数
grep -l "pattern" *.txt            # 只显示文件名
grep -w "word" file.txt            # 全词匹配
grep -A 3 "pattern" file.txt       # 后3行
grep -B 3 "pattern" file.txt       # 前3行
grep -C 3 "pattern" file.txt       # 前后3行
grep -E "pat1|pat2" file.txt       # 扩展正则
grep -P "\d{3}" file.txt           # Perl正则
grep -f patterns.txt file.txt      # 从文件读取模式
```

### 5.2 sed

```bash
sed 's/old/new/' file.txt          # 替换第一个
sed 's/old/new/g' file.txt         # 替换所有
sed -i 's/old/new/g' file.txt      # 原地修改
sed -n '5,10p' file.txt            # 打印5-10行
sed '5d' file.txt                  # 删除第5行
sed '/pattern/d' file.txt          # 删除匹配行
sed '/pattern/a\new line' file.txt # 匹配行后追加
sed '/pattern/i\new line' file.txt # 匹配行前插入
sed 's/^/# /' file.txt             # 行首加注释
sed 's/[[:space:]]*$//' file.txt   # 删除行尾空格
sed -e 's/a/A/g' -e 's/b/B/g' file.txt  # 多命令
sed -n '/start/,/end/p' file.txt   # 范围匹配
```

### 5.3 awk

```bash
awk '{print $1}' file.txt          # 打印第一列
awk '{print $1, $3}' file.txt      # 打印第1和3列
awk -F: '{print $1}' /etc/passwd   # 指定分隔符
awk 'NR==5' file.txt               # 第5行
awk 'NR>=5 && NR<=10' file.txt     # 5-10行
awk '$3 > 100' file.txt            # 第3列大于100
awk '/pattern/' file.txt           # 匹配行
awk '{sum+=$1} END{print sum}' file.txt  # 求和
awk '{sum+=$1; count++} END{print sum/count}' file.txt  # 平均值
awk '{print NR, $0}' file.txt      # 带行号
awk 'BEGIN{OFS=","} {print $1,$2}' file.txt  # 输出分隔符
awk '{a[$1]++} END{for(k in a) print k,a[k]}' file.txt  # 统计频次
```

## 6. 重定向与管道

```bash
command > file                     # 标准输出重定向（覆盖）
command >> file                    # 标准输出重定向（追加）
command 2> file                    # 标准错误重定向
command &> file                    # 标准输出+错误重定向
command > file 2>&1                # 同上（旧写法）
command 2>&1 | tee output.log     # 同时输出到终端和文件

command < file                     # 标准输入重定向

cat << EOF
multi line text
variable: $VAR
EOF

cat << 'EOF'
no variable expansion
EOF

diff <(command1) <(command2)       # 进程替换
```

## 7. 正则表达式

### 7.1 BRE（基本正则）

```bash
.                                  # 任意字符
*                                  # 前一个字符0次或多次
^ $                                # 行首/行尾
[abc]                              # 字符集
[^abc]                             # 取反
\{m,n\}                            # m到n次
\( \)                              # 分组
```

### 7.2 ERE（扩展正则，grep -E / awk）

```bash
+                                  # 前一个字符1次或多次
?                                  # 前一个字符0次或1次
{m,n}                              # m到n次
()                                 # 分组
|                                  # 或
\b                                 # 单词边界
```

### 7.3 常用模式

```bash
grep -E '[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}' file  # IP地址
grep -E '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}' file  # Email
grep -E '^(https?|ftp)://' file                                   # URL
grep -E '^\s*$' file                                               # 空行
```

## 8. 脚本调试

### 8.1 set 选项

```bash
set -x                             # 打印执行的每条命令
set +x                             # 关闭
set -e                             # 命令失败立即退出
set -u                             # 使用未定义变量报错
set -o pipefail                    # 管道中任一命令失败则整体失败

set -euo pipefail                  # 常用组合
```

### 8.2 trap 信号处理

```bash
cleanup() {
    rm -f /tmp/myapp_$$.*
    echo "Cleanup done"
}

trap cleanup EXIT                  # 退出时执行
trap 'echo "Interrupted"; exit 130' INT TERM
trap 'echo "Error at line $LINENO"; exit 1' ERR

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT
```

## 9. 高级技巧

### 9.1 并发执行

```bash
# 后台任务 + wait
for host in host1 host2 host3; do
    ssh "$host" "uptime" &
done
wait
echo "All done"

# xargs 并行
cat hosts.txt | xargs -P 10 -I {} ssh {} "uptime"

# GNU parallel
parallel -j 10 ssh {} "uptime" ::: host1 host2 host3

# 限制并发数
MAX_PARALLEL=5
running=0
for task in "${tasks[@]}"; do
    process_task "$task" &
    ((running++))
    if [[ $running -ge $MAX_PARALLEL ]]; then
        wait -n
        ((running--))
    fi
done
wait
```

### 9.2 安全编程

```bash
#!/bin/bash
set -euo pipefail

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

if [[ $EUID -ne 0 ]]; then
    echo "This script must be run as root" >&2
    exit 1
fi

if [[ $# -lt 1 ]]; then
    echo "Usage: $0 <argument>" >&2
    exit 1
fi
```

## 10. 常用脚本模板

### 10.1 日志轮转

```bash
#!/bin/bash
set -euo pipefail

LOG_DIR="/var/log/myapp"
MAX_DAYS=30
MAX_FILES=10

find "$LOG_DIR" -name "*.log" -mtime +$MAX_DAYS -delete

count=$(find "$LOG_DIR" -name "*.log" | wc -l)
if [[ $count -gt $MAX_FILES ]]; then
    find "$LOG_DIR" -name "*.log" -printf '%T+ %p\n' | sort | head -n $((count - MAX_FILES)) | awk '{print $2}' | xargs rm -f
fi
```

### 10.2 健康检查

```bash
#!/bin/bash
set -euo pipefail

check_http() {
    local url=$1
    local status
    status=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url")
    if [[ $status -eq 200 ]]; then
        echo "[OK] $url -> $status"
        return 0
    else
        echo "[FAIL] $url -> $status"
        return 1
    fi
}

check_port() {
    local host=$1
    local port=$2
    if nc -z -w 3 "$host" "$port" 2>/dev/null; then
        echo "[OK] $host:$port"
        return 0
    else
        echo "[FAIL] $host:$port"
        return 1
    fi
}

check_disk() {
    local threshold=${1:-90}
    local failed=0
    while read -r line; do
        usage=$(echo "$line" | awk '{print $5}' | tr -d '%')
        mount=$(echo "$line" | awk '{print $6}')
        if [[ $usage -gt $threshold ]]; then
            echo "[WARN] $mount is ${usage}% full"
            failed=1
        fi
    done < <(df -h | grep '^/dev')
    return $failed
}
```

### 10.3 批量部署

```bash
#!/bin/bash
set -euo pipefail

HOSTS_FILE="hosts.txt"
REMOTE_DIR="/opt/myapp"
LOCAL_DIR="./dist"

deploy() {
    local host=$1
    echo "Deploying to $host..."
    rsync -avz --delete "$LOCAL_DIR/" "$host:$REMOTE_DIR/"
    ssh "$host" "cd $REMOTE_DIR && ./restart.sh"
    echo "[$host] Deploy complete"
}

for host in $(cat "$HOSTS_FILE"); do
    deploy "$host" &
done
wait
echo "All hosts deployed"
```

## 11. 面试题

### 1. `$@` 和 `$*` 的区别？

- `"$@"`：每个参数独立，`"$1" "$2" "$3"`
- `"$*"`：所有参数作为一个，`"$1 $2 $3"`
- 不加引号时行为相同

### 2. `[ ]` 和 `[[ ]]` 的区别？

- `[ ]` 是 POSIX 标准，兼容性好
- `[[ ]]` 是 Bash 扩展，支持 `&&`/`||`/`<`/`>`/模式匹配
- `[[ ]]` 不需要引号保护变量

### 3. 如何调试 Shell 脚本？

```bash
bash -x script.sh                  # 打印每条命令
bash -n script.sh                  # 语法检查
bash -v script.sh                  # 打印每行
shellcheck script.sh               # 静态分析
```
