# Lua 与 C++ 交互

Lua 与 C/C++ 交互是 Lua 最强大的特性之一，允许 Lua 调用 C 函数，也允许 C 调用 Lua 函数。

## C API 基础

### 栈模型

Lua 与 C 之间通过虚拟栈交换数据：

```
栈顶 →  | arg3 |
        | arg2 |
        | arg1 |
栈底 →  | nil  |
```

- 压栈：C 向栈推入值
- 出栈：C 从栈取出值
- 索引：正数从栈底（1），负数从栈顶（-1）

### 基本操作

```c
#include <lua.h>
#include <lauxlib.h>
#include <lualib.h>

lua_State *L = luaL_newstate();
luaL_openlibs(L);

// 压栈
lua_pushstring(L, "hello");
lua_pushnumber(L, 42);
lua_pushboolean(L, 1);

// 取值
const char *s = lua_tostring(L, -3);  // "hello"
double n = lua_tonumber(L, -2);       // 42
int b = lua_toboolean(L, -1);         // 1

// 类型检查
lua_isstring(L, -3);
lua_isnumber(L, -2);

// 栈大小
int top = lua_gettop(L);
lua_settop(L, 0);  // 清空栈

lua_close(L);
```

## C 调用 Lua

### 执行 Lua 代码

```c
luaL_dostring(L, "print('hello from C')");

luaL_dofile(L, "script.lua");
```

### 调用 Lua 函数

```c
lua_getglobal(L, "add");       // 获取全局函数
lua_pushnumber(L, 10);         // 参数1
lua_pushnumber(L, 20);         // 参数2

if (lua_pcall(L, 2, 1, 0) != 0) {
    fprintf(stderr, "error: %s\n", lua_tostring(L, -1));
    lua_pop(L, 1);
    return -1;
}

double result = lua_tonumber(L, -1);
lua_pop(L, 1);                 // 弹出返回值
```

### 读取 Lua 全局变量

```c
lua_getglobal(L, "config");
if (lua_istable(L, -1)) {
    lua_getfield(L, -1, "port");
    int port = lua_tointeger(L, -1);
    lua_pop(L, 1);

    lua_getfield(L, -1, "host");
    const char *host = lua_tostring(L, -1);
    lua_pop(L, 1);
}
lua_pop(L, 1);  // pop config table
```

## Lua 调用 C

### 注册 C 函数

```c
static int l_add(lua_State *L) {
    double a = luaL_checknumber(L, 1);
    double b = luaL_checknumber(L, 2);
    lua_pushnumber(L, a + b);
    return 1;  // 返回值个数
}

static int l_greet(lua_State *L) {
    const char *name = luaL_checkstring(L, 1);
    lua_pushfstring(L, "Hello, %s!", name);
    return 1;
}

static const struct luaL_Reg mylib[] = {
    {"add", l_add},
    {"greet", l_greet},
    {NULL, NULL}
};

int luaopen_mylib(lua_State *L) {
    luaL_newlib(L, mylib);
    return 1;
}
```

### 编译为动态库

```bash
gcc -shared -fPIC -o mylib.so mylib.c -I/usr/include/lua5.1 -llua5.1
```

### Lua 中使用

```lua
local mylib = require("mylib")
print(mylib.add(1, 2))     -- 3
print(mylib.greet("Lua"))  -- Hello, Lua!
```

## 表操作

### 创建和操作表

```c
lua_newtable(L);

lua_pushstring(L, "name");
lua_pushstring(L, "Alice");
lua_rawset(L, -3);          // table.name = "Alice"

lua_pushstring(L, "age");
lua_pushnumber(L, 25);
lua_rawset(L, -3);          // table.age = 25

lua_setglobal(L, "person"); // person = table
```

### 遍历表

```c
lua_getglobal(L, "person");
lua_pushnil(L);
while (lua_next(L, -2)) {
    const char *key = lua_tostring(L, -2);
    if (lua_isnumber(L, -1)) {
        printf("%s = %f\n", key, lua_tonumber(L, -1));
    } else if (lua_isstring(L, -1)) {
        printf("%s = %s\n", key, lua_tostring(L, -1));
    }
    lua_pop(L, 1);  // pop value, keep key
}
lua_pop(L, 1);  // pop table
```

## Userdata

### Light Userdata

```c
void *ptr = malloc(1024);
lua_pushlightuserdata(L, ptr);
lua_setglobal(L, "buffer");
```

- 轻量，只是一个 C 指针
- 没有析构函数
- 不被 GC 管理

### Full Userdata

```c
typedef struct {
    double x;
    double y;
} Point;

static int l_point_new(lua_State *L) {
    double x = luaL_checknumber(L, 1);
    double y = luaL_checknumber(L, 2);
    Point *p = (Point *)lua_newuserdata(L, sizeof(Point));
    p->x = x;
    p->y = y;
    luaL_getmetatable(L, "Point");
    lua_setmetatable(L, -2);
    return 1;
}

static int l_point_x(lua_State *L) {
    Point *p = (Point *)luaL_checkudata(L, 1, "Point");
    lua_pushnumber(L, p->x);
    return 1;
}

static int l_point_tostring(lua_State *L) {
    Point *p = (Point *)luaL_checkudata(L, 1, "Point");
    lua_pushfstring(L, "Point(%f, %f)", p->x, p->y);
    return 1;
}
```

### 元表注册

```c
static const struct luaL_Reg point_methods[] = {
    {"new", l_point_new},
    {"x", l_point_x},
    {"__tostring", l_point_tostring},
    {NULL, NULL}
};

int luaopen_point(lua_State *L) {
    luaL_newmetatable(L, "Point");
    lua_pushvalue(L, -1);
    lua_setfield(L, -2, "__index");
    luaL_setfuncs(L, point_methods, 0);
    lua_pop(L, 1);

    luaL_newlib(L, point_methods);
    return 1;
}
```

## C++ 绑定框架

### LuaBridge

```cpp
#include <LuaBridge/LuaBridge.h>

class Player {
public:
    Player(const std::string &name) : name_(name), hp_(100) {}
    std::string getName() const { return name_; }
    int getHp() const { return hp_; }
    void takeDamage(int dmg) { hp_ -= dmg; }
private:
    std::string name_;
    int hp_;
};

void registerClasses(lua_State *L) {
    luabridge::getGlobalNamespace(L)
        .beginClass<Player>("Player")
        .addConstructor<void(*)(const std::string &)>()
        .addProperty("name", &Player::getName)
        .addProperty("hp", &Player::getHp)
        .addFunction("takeDamage", &Player::takeDamage)
        .endClass();
}
```

### sol2

```cpp
#include <sol/sol.hpp>

sol::state lua;
lua.open_libraries(sol::lib::base);

lua.new_usertype<Player>("Player",
    sol::constructors<Player(const std::string &)>(),
    "name", &Player::getName,
    "hp", &Player::getHp,
    "takeDamage", &Player::takeDamage
);

lua.script(R"(
    local p = Player.new("Alice")
    p:takeDamage(20)
    print(p.name, p.hp)
)");
```

### 框架对比

| 框架 | 特点 | 头文件 |
|------|------|--------|
| LuaBridge | 轻量，API 简洁 | 单头文件 |
| sol2 | 功能全，C++14 | 单头文件 |
| LuaIntf | 轻量，支持 Lua 5.1-5.3 | 多文件 |
| SWIG | 自动生成绑定，支持多语言 | 需生成代码 |

## 错误处理

```c
if (lua_pcall(L, nargs, nresults, 0) != LUA_OK) {
    const char *err = lua_tostring(L, -1);
    fprintf(stderr, "Lua error: %s\n", err);
    lua_pop(L, 1);
}

// C 抛出 Lua 错误
luaL_error(L, "invalid argument: expected number, got %s", luaL_typename(L, 1));
```

## 内存管理

```c
// 自定义分配器
void *my_alloc(void *ud, void *ptr, size_t osize, size_t nsize) {
    if (nsize == 0) {
        free(ptr);
        return NULL;
    }
    return realloc(ptr, nsize);
}

lua_State *L = lua_newstate(my_alloc, NULL);
```
