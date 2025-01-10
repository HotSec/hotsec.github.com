# Python基础

- [1. Python解释器](#1-python解释器)
- [2. 控制流](#2-控制流)
  - [2.1. if](#21-if)
  - [2.2. for](#22-for)
  - [2.3. range](#23-range)
  - [2.4. beak、continue、else](#24-beakcontinueelse)
  - [2.5. pass](#25-pass)
  - [2.6. match](#26-match)
- [3. 函数](#3-函数)
  - [3.1. 定义](#31-定义)
  - [3.2. 默认值函数](#32-默认值函数)
  - [3.3. 关键字参数](#33-关键字参数)
  - [3.4. 特殊参数 `/` `*`](#34-特殊参数--)
  - [3.5. 任意实参列表 \*args](#35-任意实参列表-args)
  - [3.6. 解包实参列表 \*\*kwargs](#36-解包实参列表-kwargs)
  - [3.7. Lambda表达式](#37-lambda表达式)
  - [3.8. 文档字符串](#38-文档字符串)
  - [3.9. 函数注解](#39-函数注解)
- [4. 变量](#4-变量)
- [5. 注释](#5-注释)
- [6. 数据结构](#6-数据结构)
  - [6.1. 字符串](#61-字符串)
  - [6.2. 整数、浮点数](#62-整数浮点数)
  - [6.3. 列表list](#63-列表list)
  - [6.4. 元组](#64-元组)
  - [6.5. 字典dict](#65-字典dict)
  - [6.6. 集合set](#66-集合set)
- [7. 模块](#7-模块)
  - [7.1. 以脚本方式执行模块](#71-以脚本方式执行模块)
  - [7.2. 模块导入](#72-模块导入)
  - [7.3. 模块搜索路径](#73-模块搜索路径)
  - [7.4. `.pyc` `__pycache__`](#74-pyc-__pycache__)
  - [7.5. dir()函数](#75-dir函数)
  - [7.6. 包](#76-包)
- [8. 输入与输出](#8-输入与输出)
  - [8.1. 文件操作](#81-文件操作)
- [9. 错误和异常](#9-错误和异常)
  - [9.1. 语法错误](#91-语法错误)
  - [9.2. 异常](#92-异常)
  - [9.3. 异常的处理](#93-异常的处理)
  - [9.4. 触发异常](#94-触发异常)
  - [9.5. 异常链](#95-异常链)
  - [9.6. 用户自定义异常](#96-用户自定义异常)
  - [9.7. 定义清理操作](#97-定义清理操作)
  - [9.8. 预定义的清理操作](#98-预定义的清理操作)
  - [9.9. 引发和处理多个不相关的异常](#99-引发和处理多个不相关的异常)
  - [9.10. 用注释细化异常情况](#910-用注释细化异常情况)
- [10. 类](#10-类)
  - [10.1. 名称和对象](#101-名称和对象)
  - [10.2. 命名空间/作用域](#102-命名空间作用域)
  - [10.3. 类定义](#103-类定义)
  - [10.4. Class对象](#104-class对象)
  - [10.5. 实例对象](#105-实例对象)
  - [10.6. 方法对象](#106-方法对象)
  - [10.7. 类和实例变量](#107-类和实例变量)
  - [10.8. 继承](#108-继承)
  - [10.9. 多重继承](#109-多重继承)
  - [10.10. 私有变量](#1010-私有变量)
  - [10.11. ‘结构体’](#1011-结构体)
  - [10.12. 迭代器](#1012-迭代器)
  - [10.13. 生成器](#1013-生成器)
  - [10.14. 生成器表达式](#1014-生成器表达式)
- [11. 虚拟环境和包](#11-虚拟环境和包)
- [12. 并发编程](#12-并发编程)
- [13. async/awit](#13-asyncawit)
- [14. 内置函数与变量](#14-内置函数与变量)
- [15. 编码风格](#15-编码风格)

## 1. Python解释器

## 2. 控制流

### 2.1. if

### 2.2. for

### 2.3. range

### 2.4. beak、continue、else

- break 语句用于跳出循环。
- continue 语句用于跳过当前循环，然后继续进行下一轮循环。
- else 语句块在循环正常结束时执行，条件为 true 时执行。
  - else 语句块在循环被 break 语句终止时不会执行。
  - else 在try语句中，当没有异常被抛出时执行。

### 2.5. pass

### 2.6. match

- <https://docs.python.org/zh-cn/3/tutorial/controlflow.html#match-statements>

```python
def http_error(status):
    match status:
        case 400:
            return "Bad request"
        case 401 | 403 | 404:
            return "Not allowed"
        case 404:
            return "Not found"
        case 418:
            return "I'm a teapot"
        case _:
            return "Something's wrong with the internet"
```

```python
class Point:
    def __init__(self, x, y):
        self.x = x
        self.y = y

def where_is(point):
    match point:
        case Point(x=0, y=0):
            print("Origin")
        case Point(x=0, y=y):
            print(f"Y={y}")
        case Point(x=x, y=0):
            print(f"X={x}")
        case Point():
            print("Somewhere else")
        case _:
            print("Not a point")
```

## 3. 函数

### 3.1. 定义

### 3.2. 默认值函数

### 3.3. 关键字参数

### 3.4. 特殊参数 `/` `*`

```python
def f(pos1, pos2, /, pos_or_kwd, *, kwd1, kwd2):
      -----------    ----------     ----------
        |             |                  |
        |        Positional or keyword   |
        |                                - Keyword only
         -- Positional only
```

- 位置或关键字参数
- 仅位置参数
  - 此处再介绍一些细节，特定形参可以标记为 仅限位置。仅限位置 时，形参的顺序很重要，且这些形参不能用关键字传递。仅限位置形参应放在 `/` （正斜杠）前。`/`用于在逻辑上分割仅限位置形参与其它形参。如果函数定义中没有 `/`，则表示没有仅限位置形参。
  - `/` 后可以是 位置或关键字 或 仅限关键字 形参。
- 仅限关键字参数
  - 在参数列表中第一个 仅限关键字 形参前添加 `*`。

### 3.5. 任意实参列表 *args

### 3.6. 解包实参列表 **kwargs

### 3.7. Lambda表达式

- `lambda a, b: a+b` 函数返回两个参数的和

### 3.8. 文档字符串

```python
def my_function():
    """Do nothing, but document it.

    No, really, it doesn't do anything.
    """
    pass

print(my_function.__doc__)
Do nothing, but document it.

    No, really, it doesn't do anything.
```

### 3.9. 函数注解

- 可选的用户自定义函数类型的元数据完整信息
- 标注 以字典的形式存放在函数的 __annotations__ 属性中而对函数的其他部分没有影响

```python
def f(ham: str, eggs: str = 'eggs') -> str:
    print("Annotations:", f.__annotations__)
    print("Arguments:", ham, eggs)
    return ham + ' and ' + eggs

f('spam')
Annotations: {'ham': <class 'str'>, 'return': <class 'str'>, 'eggs': <class 'str'>}
Arguments: spam eggs
'spam and eggs'
```

## 4. 变量

- 命名
  - 字母、数字和下划线，不能以数字开头
  - 不要与python关键字和函数名一样
  - ps: python3中变量名可以包含Unicode字符，支持中文，但是不推荐

## 5. 注释

- 单行注释 `#`
- 多行注释 `'''` `"""`
- 注释不能嵌套
- `'''` `"""` 也可以用于文档字符串，用于解释代码

## 6. 数据结构

### 6.1. 字符串

```python
"hello"
'hello'
'''hello'''
"""hello"""
'"hello" world' 

# f-string f字符串
name = "hello"
age = "42"
info = f"{name}:{age}"

>>> 'aa bb'.title()
'Aa Bb'
>>> 'hello world'.title()
'Hello World'
>>> 'hello world'.upper()
'HELLO WORLD'
>>> 'hello world'.lower()
'hello world'
>>> 'hello   '.strip()
'hello'
>>> 'hello   '.lstrip()
'hello   '
>>> 'hello   '.rstrip()
'hello'
>>> nostarch_url = 'https://nostarch.com'
>>> nostarch_url.removeprefix('https://')
'nostarch.com'
\t
\n
```

### 6.2. 整数、浮点数

```python
>>> 4/2 # 有一个操作数是浮点数，结果就是浮点数
2.0
>>> 1+2
3
>>> 1+2.0
3.0
>>> 3.0**2
9.0
>>> 100_000_000  # 特别大的数可以用_分组，_会被忽略
100000000
>>> a,b,c=1,2,3 # 同时给多个变量赋值
>>> a
1
>>> b
2
>>> c
3
>>> MAX_LIMIT = 1000 # python没有内置的常量，一般会将全大写字母命名的变量视为常量
>>> 5/2
2.5
>>> 5//2
2
>>> 5%2
1
```

`#` 单行注释
'''多行注释'''
"""多行注释"""
多行注释不能嵌套

### 6.3. 列表list

- list.append(x)
- list.extend(iterable)
- list.insert(i, x)
- list.remove(x)
- list.pop([i])
- list.clear()  相当于del a[:]
- list.index(x[,start[,end]])
- list.count(x)
- list.sort(*, key=None, reverse=False)
- list.reverse()
- list.copy() 返回列表的浅拷贝，相当于a[:]

- 列表推导式
  - squares = [x**2 for x in range(10)]
  - [(x, y) for x in [1,2,3] for y in [3,1,4] if x != y]

  - ```python
    combs = []
    for x in [1,2,3]:
        for y in [3,1,4]:
            if x != y:
                combs.append((x, y))

    combs
    [(1, 3), (1, 4), (2, 3), (2, 1), (2, 4), (3, 1), (3, 4)]
    ```

- 嵌套的列表推导式

```python
>>> list_1 = ["one","two","three"]
>>> print(list_1[0])
one
>>> print(list_1[0].title())
One
>>> print(list_1[-1])
three
>>> print(list_1.append("444"))
None
>>> list_1.append("444")
>>> list_1
['one', 'two', 'three', '444', '444']

>>> list_1.insert(0, '01234')
>>> list_1
['01234', 'one', 'two', 'three', '444', '444']

>>> del list_1[1]
>>> list_1
['01234', 'two', 'three', '444', '444']
>>> list_1.pop()
'444'
>>> list_1
['01234', 'two', 'three', '444']
>>> list_1.pop(2)
'three'
>>> list_1
['01234', 'two', '444']
>>> list_1.remove('two')
>>> list_1
['01234', '444']

>>> list_2 = [1,2,3,4,5,6,7,8,9.0]
>>> list_2.sort()
>>> list_2
[1, 2, 3, 4, 5, 6, 7, 8, 9.0]
>>> list_2 = [1,2,3,4,5,6,7,8,9,0]
>>> list_2.sort()
>>> list_2
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> list_2.sort(reverse=True)
>>> list_2
[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
>>> sorted(list_2)
[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
>>> list_2
[9, 8, 7, 6, 5, 4, 3, 2, 1, 0]

>>> [value**2 for value in range(1,11)]
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]

# 切片
>>> list_3 = [value**2 for value in range(1,11)]
>>> list_3
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
>>> list_3[0:3]
[1, 4, 9]
>>> list_3[2:4]
[9, 16]
>>> list_3[:4]
[1, 4, 9, 16]
>>> list_3[4:]
[25, 36, 49, 64, 81, 100]
>>> list_4 = list_3[:]
>>> list_4
[1, 4, 9, 16, 25, 36, 49, 64, 81, 100]
```

### 6.4. 元组

```python
>>> tuple_1 = (1,2,3,4,5,6)
>>> tuple_1
(1, 2, 3, 4, 5, 6)
```

### 6.5. 字典dict

- .items()
- .values()
- .items()

### 6.6. 集合set

## 7. 模块

### 7.1. 以脚本方式执行模块

### 7.2. 模块导入

- import xxx

### 7.3. 模块搜索路径

1. 内置模块
2. sys.path
   1. 被命令执行直接运行的脚本所在的目录（或未指定文件时的当前目录）
   2. PYTHONPATH
   3. 依赖于安装的默认值 site-packages

### 7.4. `.pyc` `__pycache__`

### 7.5. dir()函数

- 用于查找模块定义的名称，返回结果是经过排序的字符串列表

### 7.6. 包

- __init__.py python将包含该文件的目录当做包来处理。
- `__all__`
- `from package import *` 导入模块名列表，__all__
- 相对导入
  - `from . import echo`
  - `from .. import formats`
  - `from ..filters import equalizer`
  - 相对导入基于当前模块名。因为主模块名永远是 "__main__" ，所以如果计划将一个模块用作 Python 应用程序的主模块，那么该模块内的导入语句必须始终使用绝对导入。
- __path__
  - 一个只包含*__init__.py 所在目录的名称*的列表
  - 修改此变量，会改变此宝宝中搜索模块和子包的方式

## 8. 输入与输出

### 8.1. 文件操作

## 9. 错误和异常

### 9.1. 语法错误

- SyntaxError

### 9.2. 异常

- ZeroDivisionError
- NameError
- TypeError
- KeyboardInterrupt 用户中断程序会触发 KeyboardInterrupt 异常。

### 9.3. 异常的处理

- try ... except

### 9.4. 触发异常

- raise

### 9.5. 异常链

- `raise RuntimeError from exc` # exc must be exception instance or None.
- from None表达禁用自动异常链

### 9.6. 用户自定义异常

### 9.7. 定义清理操作

- finally子句
- 不论 try 语句是否触发异常，都会执行 finally 子句。
- 如果执行 try 子句期间触发了某个异常，则某个 except 子句应处理该异常。如果该异常没有 except 子句处理，在 finally 子句执行后会被重新触发。
- except 或 else 子句执行期间也会触发异常。 同样，该异常会在 finally 子句执行之后被重新触发。
- 如果 finally 子句中包含 break、continue 或 return 等语句，异常将不会被重新引发。
- 如果执行 try 语句时遇到 break,、continue 或 return 语句，则 finally 子句在执行 break、continue 或 return 语句之前执行。
- 如果 finally 子句中包含 return 语句，则返回值来自 finally 子句的某个 return 语句的返回值，而不是来自 try 子句的 return 语句的返回值。

```python
def divide(x, y):
    try:
        result = x / y
    except ZeroDivisionError:
        print("division by zero!")
    else:
        print("result is", result)
    finally:
        print("executing finally clause")

divide(2, 1)
result is 2.0
executing finally clause
divide(2, 0)
division by zero!
executing finally clause
divide("2", "1")
executing finally clause
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
  File "<stdin>", line 3, in divide
TypeError: unsupported operand type(s) for /: 'str' and 'str'
```

- 在实际应用程序中，finally 子句对于释放外部资源（例如文件或者网络连接）非常有用，无论是否成功使用资源。

### 9.8. 预定义的清理操作

### 9.9. 引发和处理多个不相关的异常

- except*

```python
# except* 子句都从组中提取了某种类型的异常，而让所有其他的异常传播到其他子句，并最终被重新引发。
def f():
    raise ExceptionGroup(
        "group1",
        [
            OSError(1),
            SystemError(2),
            ExceptionGroup(
                "group2",
                [
                    OSError(3),
                    RecursionError(4)
                ]
            )
        ]
    )

try:
    f()
except* OSError as e:
    print("There were OSErrors")
except* SystemError as e:
    print("There were SystemErrors")

There were OSErrors
There were SystemErrors
  + Exception Group Traceback (most recent call last):
  |   File "<stdin>", line 2, in <module>
  |   File "<stdin>", line 2, in f
  | ExceptionGroup: group1
  +-+---------------- 1 ----------------
    | ExceptionGroup: group2
    +-+---------------- 1 ----------------
      | RecursionError: 4
      +------------------------------------
```

- 注意： 嵌套在一个异常组中的异常必须是实例,而不是类型。

```python
excs = []
for test in tests:
    try:
        test.run()
    except Exception as e:
        excs.append(e)

if excs:
   raise ExceptionGroup("Test Failures", excs)
```

### 9.10. 用注释细化异常情况

- 异常有一个 add_note(note) 方法接受一个字符串，并将其添加到异常的注释列表。
- 标准的回溯在异常之后按照它们被添加的顺序呈现包括所有的注释。

```python
def f():
    raise OSError('operation failed')

excs = []
for i in range(3):
    try:
        f()
    except Exception as e:
        e.add_note(f'Happened in Iteration {i+1}')
        excs.append(e)

raise ExceptionGroup('We have some problems', excs)
  + Exception Group Traceback (most recent call last):
  |   File "<stdin>", line 1, in <module>
  | ExceptionGroup: We have some problems (3 sub-exceptions)
  +-+---------------- 1 ----------------
    | Traceback (most recent call last):
    |   File "<stdin>", line 3, in <module>
    |   File "<stdin>", line 2, in f
    | OSError: operation failed
    | Happened in Iteration 1
    +---------------- 2 ----------------
    | Traceback (most recent call last):
    |   File "<stdin>", line 3, in <module>
    |   File "<stdin>", line 2, in f
    | OSError: operation failed
    | Happened in Iteration 2
    +---------------- 3 ----------------
    | Traceback (most recent call last):
    |   File "<stdin>", line 3, in <module>
    |   File "<stdin>", line 2, in f
    | OSError: operation failed
    | Happened in Iteration 3
    +------------------------------------

```

## 10. 类

### 10.1. 名称和对象

- 对象之间相互独立
- 多个名称可以绑定导同一对象

### 10.2. 命名空间/作用域

- namespace 命令空间
- `.`点号之后的名称属性
- 内置名称的命令空间是在python解释器启动时创建的，永远不会被删除
- 模块的全局命名空间在读取模块定义时创建，通常，模块命令空间也会持续到解释器退出。
- 函数的局部命名空间在函数被调用时创建，并在函数返回或者抛出未在函数内被处理的异常时，被删除
- 一个命名空间的作用域时python代码中的一段文本区域，从这个区域可直接访问该命名空间。

- 访问顺序
  - 最内层作用域，包含局部名称
  - 外层闭包函数的作用域
  - 包含当前模块的全局名称
  - 内置名称的命令空间
- global语句用于表明特定的变量在全局作用域例
- nonlocal语句表明特定的变量在外层作用域中

### 10.3. 类定义

```python
class ClassName:
    <statement-1>
    .
    .
    .
    <statement-N>
```

### 10.4. Class对象

### 10.5. 实例对象

### 10.6. 方法对象

### 10.7. 类和实例变量

### 10.8. 继承

### 10.9. 多重继承

### 10.10. 私有变量

- _
- __xx -> _XxxClass__xx

### 10.11. ‘结构体’

```python
from dataclasses import dataclass

@dataclass
class Employee:
    name: str
    dept: str
    salary: int

>>> john = Employee('john', 'computer lab', 1000)
>>> john.dept
'computer lab'
>>> john.salary
1000
```

### 10.12. 迭代器

- iter() for语句会在容器对象上调用iter()
  - 该函数返回一个定义了__next__()方法的迭代器对象
- __iter__
- __next__()
  - 当元素用尽，将会引发StopIteration异常来终止for虚幻
  - 可以使用next()内置函数来调用__next__()方法

```python
>>> s = 'abc'
it = iter(s)
>>> it
<str_iterator object at 0x10c90e650>
>>> next(it)
'a'
>>> next(it)
'b'
>>> next(it)
'c'
>>> next(it)
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
    next(it)
StopIteration
```

```python
class Reverse:
    """Iterator for looping over a sequence backwards."""
    def __init__(self, data):
        self.data = data
        self.index = len(data)

    def __iter__(self):
        return self

    def __next__(self):
        if self.index == 0:
            raise StopIteration
        self.index = self.index - 1
        return self.data[self.index]

>>> rev = Reverse('spam')
iter(rev)
<__main__.Reverse object at 0x00A1DB50>
>>> for char in rev:
...    print(char)
...
m
a
p
s
```

### 10.13. 生成器

- 生成器 是一个用于创建迭代器的简单而强大的工具。 它们的写法类似于标准的函数，但当它们要返回数据时会使用 yield 语句。 每次在生成器上调用 next() 时，它会从上次离开的位置恢复执行（它会记住上次执行语句时的所有数据值）。

```python
def reverse(data):
    for index in range(len(data)-1, -1, -1):
        yield data[index]

for char in reverse('golf'):
    print(char)

f
l
o
g
```

### 10.14. 生成器表达式

- 设计用于生成器将立即被外层函数所使用的情况。 生成器表达式相比完整的生成器更紧凑但较不灵活，相比等效的列表推导式则更为节省内存。

```python
>>> sum(i*i for i in range(10))                 # sum of squares
285

>>> xvec = [10, 20, 30]
>>> yvec = [7, 5, 3]
>>> sum(x*y for x,y in zip(xvec, yvec))         # dot product
260

>>> unique_words = set(word for line in page  for word in line.split())

>>> valedictorian = max((student.gpa, student.name) for student in graduates)

>>> data = 'golf'
>>> list(data[i] for i in range(len(data)-1, -1, -1))
['f', 'l', 'o', 'g']
```

## 11. 虚拟环境和包

## 12. 并发编程

- 多线程
- 多进程
- 多进程+多线程
- 协程


## 13. async/awit

## 14. 内置函数与变量

```python
import builtins
dir(builtins)  
['ArithmeticError', 'AssertionError', 'AttributeError', 'BaseException', 'BaseExceptionGroup', 'BlockingIOError', 'BrokenPipeError', 'BufferError', 'BytesWarning', 'ChildProcessError', 'ConnectionAbortedError', 'ConnectionError', 'ConnectionRefusedError', 'ConnectionResetError', 'DeprecationWarning', 'EOFError', 'Ellipsis', 'EncodingWarning', 'EnvironmentError', 'Exception', 'ExceptionGroup', 'False', 'FileExistsError', 'FileNotFoundError', 'FloatingPointError', 'FutureWarning', 'GeneratorExit', 'IOError', 'ImportError', 'ImportWarning', 'IndentationError', 'IndexError', 'InterruptedError', 'IsADirectoryError', 'KeyError', 'KeyboardInterrupt', 'LookupError', 'MemoryError', 'ModuleNotFoundError', 'NameError', 'None', 'NotADirectoryError', 'NotImplemented', 'NotImplementedError', 'OSError', 'OverflowError', 'PendingDeprecationWarning', 'PermissionError', 'ProcessLookupError', 'RecursionError', 'ReferenceError', 'ResourceWarning', 'RuntimeError', 'RuntimeWarning', 'StopAsyncIteration', 'StopIteration', 'SyntaxError', 'SyntaxWarning', 'SystemError', 'SystemExit', 'TabError', 'TimeoutError', 'True', 'TypeError', 'UnboundLocalError', 'UnicodeDecodeError', 'UnicodeEncodeError', 'UnicodeError', 'UnicodeTranslateError', 'UnicodeWarning', 'UserWarning', 'ValueError', 'Warning', 'WindowsError', 'ZeroDivisionError', '_', '__build_class__', '__debug__', '__doc__', '__import__', '__loader__', '__name__', '__package__', '__spec__', 'abs', 'aiter', 'all', 'anext', 'any', 'ascii', 'bin', 'bool', 'breakpoint', 'bytearray', 'bytes', 'callable', 'chr', 'classmethod', 'compile', 'complex', 'copyright', 'credits', 'delattr', 'dict', 'dir', 'divmod', 'enumerate', 'eval', 'exec', 'exit', 'filter', 'float', 'format', 'frozenset', 'getattr', 'globals', 'hasattr', 'hash', 'help', 'hex', 'id', 'input', 'int', 'isinstance', 'issubclass', 'iter', 'len', 'license', 'list', 'locals', 'map', 'max', 'memoryview', 'min', 'next', 'object', 'oct', 'open', 'ord', 'pow', 'print', 'property', 'quit', 'range', 'repr', 'reversed', 'round', 'set', 'setattr', 'slice', 'sorted', 'staticmethod', 'str', 'sum', 'super', 'tuple', 'type', 'vars', 'zip']
```

- enumerate()
- reversed()
- sorted()
- set()

## 15. 编码风格

- 缩进，用 4 个空格，不要用制表符。
- 4 个空格是小缩进（更深嵌套）和大缩进（更易阅读）之间的折中方案。制表符会引起混乱，最好别用。
- 换行，一行不超过 79 个字符。
- 这样换行的小屏阅读体验更好，还便于在大屏显示器上并排阅读多个代码文件。
- 用空行分隔函数和类，及函数内较大的代码块。
- 最好把注释放到单独一行。
- 使用文档字符串。
- 运算符前后、逗号后要用空格，但不要直接在括号内使用： a = f(1, 2) + g(3, 4)。
- 类和函数的命名要一致；按惯例，命名类用 UpperCamelCase，命名函数与方法用 lowercase_with_underscores。命名方法中第一个参数总是用 self (类和方法详见 初探类)。
- 编写用于国际多语环境的代码时，不要用生僻的编码。Python 默认的 UTF-8 或纯 ASCII 可以胜任各种情况。
- 同理，就算多语阅读、维护代码的可能再小，也不要在标识符中使用非 ASCII 字符。
