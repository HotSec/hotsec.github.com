# LuaFileSystem（lfs）

LuaFileSystem 是 Lua 的文件系统操作库，提供目录和文件操作。

## 安装

```bash
luarocks install luafilesystem
```

## 基本使用

```lua
local lfs = require("lfs")

-- 当前目录
print(lfs.currentdir())

-- 切换目录
lfs.chdir("/tmp")

-- 创建目录
lfs.mkdir("new_dir")

-- 删除空目录
lfs.rmdir("empty_dir")
```

## 目录遍历

```lua
for file in lfs.dir(".") do
    if file ~= "." and file ~= ".." then
        local attr = lfs.attributes(file)
        print(file, attr.mode, attr.size, attr.modification)
    end
end
```

## 文件属性

```lua
local attr = lfs.attributes("test.txt")
-- attr.mode: "file" / "directory"
-- attr.size: 文件大小（字节）
-- attr.modification: 修改时间（Unix 时间戳）
-- attr.access: 访问时间
-- attr.permissions: 权限字符串
```

## 符号链接

```lua
lfs.link("target", "link_name", true)  -- true = 软链接
local target = lfs.symlinkattributes("link_name")
```

## 磁盘信息

```lua
local total, used, free = lfs.diskusage("/")
print(string.format("Total: %d GB", total / 1024^3))
```

## 注意事项

- 所有操作均为**阻塞操作**，不适合高并发场景
- 路径分隔符使用 `/`（跨平台兼容）
- 大目录遍历时注意性能
