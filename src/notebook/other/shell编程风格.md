# shell编码风格


## 错误信息

```shell
err() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')]: $@" >&2
}

if ! do_something; then
    err "Unable to do_something"
    exit "${E_DID_NOTHING}"
fi
```

## 注释

- 每个文件必须包含一个顶层注释，对其内容进行简要概述。版权声明和作者信息是可选的。
- 任何不是既明显又短的函数都必须被注释。任何库函数无论其长短和复杂性都必须被注释。
  - 所有的函数注释应该包含：
    - 函数的描述
    - 全局变量的使用和修改
    - 使用的参数说明
    - 返回值，而不是上一条命令运行后默认的退出状态
```shell
#!/bin/bash
#
# Perform hot backups of Oracle databases.

export PATH='/usr/xpg4/bin:/usr/bin:/opt/csw/bin:/opt/goog/bin'

#######################################
# Cleanup files from the backup dir
# Globals:
#   BACKUP_DIR
#   ORACLE_SID
# Arguments:
#   None
# Returns:
#   None
#######################################
cleanup() {
  ...
}


# TODO(mrmonkey): Handle the unlikely edge cases (bug ####)
```

## 格式化

## 特性及错误

### 使用`$(command)`而不是反引号

```shell
# This is bad
var=`complex_command`

# This is good
var=$(complex_command)
```

### 推荐使用 [[ ... ]]

### 尽可能使用引用，而不是过滤字符串

### 当进行文件名的通配符扩展时，请使用明确的路径

### 应该避免使用eval

## 命令约定

## 调用命令
