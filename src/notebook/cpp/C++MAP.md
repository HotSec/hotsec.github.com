# C++

## 基础

### 常变量与数据类型

#### 变量作用域

#### 生命周期

#### 修饰符

- auto
- register
- extern
- static

### 程序流程控制

- for range

### 运算符与表达式

### 数组

### 指针

- nullptr (C++11)

### 引用

- 引用的本质是 const 类型的指针

- 引用与指针的区别
    1. 引用是对象的别名，指针是对象地址的别名
    2. 引用必须在创建时被初始化，指针可以在任何时候被初始化
    3. 引用一旦初始化，就不能改变引用的对象，指针可以随时改变引用的对象
    4. 引用不能为空，指针可以为空
    5. 引用是类型安全的，指针不是类型安全的
    6. 引用是隐式转换，指针是显式转换

### 函数

- 函数重载
    1. 函数名相同
    2. 参数个数不同，参数的类型不同，参数顺序不同
    3. 返回值类型，不作为重载的标准
    4. C++ 允许， int 到 long 和 double， double 到 int 和 float, int 到 short 和 char等隐式类型转换。遇到这种情型，则会引起二义性。
- extern "C"
- 默认参数
- 内联函数

### 函数重载

### 字符串

- Raw String (C++11)   R"(字符串内容)"

### 结构体

### Union共用

### Enum枚举

### 类型转换

- static_cast
- reinterpret_cast
- dynamic_cast
- const_cast
  - `const_cast<type-id>(expression)`
    - type-id 必须是一个指针或引用类型，type-id 不能是 void
    - expression 必须是一个指针或引用类型，expression 的类型必须能转换成 type-id 的类型
  - const_cast 可以用来去掉 const 或 volatile 修饰符

### 命名空间

### 文件

### 流

### 位运算

### 异常处理

- try
- catch
- throw
- execption类

### 预处理

- 宏
  - `#define PI 3.14159`
  - `#define DEBUG`
  - `#define MIN(a,b) (((a)<(b)) ? a : b)`
- 条件编译

  - ```c++
    #ifdef DEBUG
        cerr <<"Variable x = " << x << endl;
    #endif
    ```

- `#` 运算符会把 replacement-text 令牌转换为用引号引起来的字符串。
- `##` 运算符用于连接两个令牌

  - ```c++
    #include <iostream>
    using namespace std;
    
    #define concat(a, b) a ## b
    int main()
    {
      int xy = 100;
      
      cout << concat(x, y);   // 100
      return 0;
    }
    ```

- `#undef` 取消已定义的宏
- 头文件保护
- 预定义宏
  - `__LINE__` 	当前行号
  - `__FILE__` 	当前文件名
  - `__DATE__` 	文件被编译的日期
  - `__TIME__` 	文件被编译的时间
  - `__STDC__` 	如果编译器遵循 ANSI C 标准，其值为 1，否则为 0
  - `__cplusplus` 	如果编译器遵循 C++ 标准，其值为 199711L，如果是 C99 标准，其值为 199901L
  - `__func__` 	当前函数名
  - `__PRETTY_FUNCTION__` 	当前函数的修饰名

### 动态库&&静态库

### 信号处理

```C++
#include <iostream>
#include <csignal>
#include <unistd.h>
 
using namespace std;
 
void signalHandler( int signum )
{
    cout << "Interrupt signal (" << signum << ") received.\n";
 
    // 清理并关闭
    // 终止程序 
 
   exit(signum);  
 
}
 
int main ()
{
    int i = 0;
    // 注册信号 SIGINT 和信号处理程序
    signal(SIGINT, signalHandler);  
 
    while(++i){
       cout << "Going to sleep...." << endl;
       if( i == 3 ){
          raise( SIGINT);
       }
       sleep(1);
    }
 
    return 0;
}
```

## cgi

## 内存管理

### 堆

- new/delete
- malloc/free
- new/delete 与 malloc/free 的区别
    1. new/delete 是 C++ 的关键字，malloc/free 是 C 的库函数
    2. new/delete 可以自动计算对象的大小，malloc/free 需要手动计算对象的大小
    3. new/delete 可以自动调用对象的构造函数和析构函数，malloc/free 不能
    4. new/delete 返回的是对象的指针，malloc/free 返回的是 void 指针
    5. new/delete 可以抛出异常，malloc/free 不会抛出异常
- new[]/delete[]

### 栈

- 函数内部声明的变量将占用栈内存
- 后进先出 LIFO
- 从高地址到低地址增长

### RAII

- Resource Acquisition Is Initialization C++特有的资源管理方式，即资源获取即初始化，在构造函数中申请资源，在析构函数中释放资源，这样就可以保证在对象的生命周期内，资源始终被正确地管理。

## 智能指针

- unique_ptr
- shared_ptr
- weak_ptr
- auto_ptr （C++11 废弃）

## 移动语义

- 左值lvalue
  - 有标识符、可以取地址的表达式
  - 例如:
    - 变量、函数或数据成员的名字
    - 返回左值引用的表达式，如`++x、x = 1 、cout << ' '`
    - 字符串字面值常量，如`"hello"`
- 右值rvalue
  - 纯右值prvalue
    - 没有标识符、不可以取地址的表达式，一般也称称为临时对象
    - 例如:
      - 返回非引用类型的表达式，如`x + 1、x++、make_shared<int>(42)`
      - 除字符串字面值常量外的常量，如`1、1.0、true`
  - xvalue
    - 有名字的右值，一般也称称为将亡值
- 右值引用 `T&&`

- 参考图：![alt text](image/C++MAP/image.png)

- C++ 的规则是：一个临时对象会在包含这个临时对象的完整表达式估值完成后、按生成顺序的逆序被销毁，除非有生命周期延长发生

- std::move

## 函数调用约定

- __stdcall
  - C++的调用约定方式
  - 参数从右向左通过栈传递，被调用的函数在返回前清理栈
- __cdecl
  - C的调用约定方式
  - 参数从右向左通过栈传递，由调用者负责清理栈
  - 主要用在带有可变参数的函数中，如printf
- __fastcall
  - 参数通过寄存器传递，寄存器不足时再通过栈传递，被调用的函数在返回前清理栈
  - 在X64的平台上，会默认使用__ fastcall调用约定。
    - 前4个参数（在Linux 64上是6个寄存器edi，esi）从左向右传入寄存器edx ecx r8d r9d中，后面的参数从右向左入栈。
    - 浮点前4个参数传入XMM0，XMM1，XMM2，XMM3中，其它参数传递到堆栈中。
    - 被调用函数的返回值是整数时，则返回值被存放于RAX；浮点数返回在XMM0中
    - RBX、RBP、R12 - R15被划分为被调用者保存寄存器，是使用前需要push的。
- __thiscall
  - C++成员函数的调用约定方式
  - 将对象的地址传递给ecx寄存器，到达成员函数内部的时候，将ecx存储的值赋给this指针。

- 全局函数或类静态成员函数，若没有指定调用，约定默认是__cdecl。

## 函数名修饰规则

- c语言修饰名约定
  - __stdcall
    - _函数名@参数的字节数
  - __cdecl
    - _函数名
  - __fastcall
    - @函数名@参数的字节数
- c++修饰名约定
  - __stdcall
    - ?函数名@@YG参数表代号@Z
  - __cdecl
    - ?函数名@YA参数表代号@Z
  - __fastcall
    - ?函数名@@YI参数表代号@Z

  - 参数表代号如下：
    - X——void，
    - D——char，
    - E——unsigned char，
    - F——short，
    - H——int，
    - I——unsigned int，
    - J——long，
    - K——unsigned long，
    - M——float，
    - N——double，
    - _N——bool

## 开发环境

### vs

### vsc

## 类

### 构造函数

### 析构函数

### 初始化参数列表(initializelist)

类成员初始化的顺序与初始化参数列表的顺序无关，与其声明的顺序有关。

### this指针

### 返回值优化

(具名)返回值优化((Name)Return Value Optimization，简称(N)RVO)，是这么一种优化机制：当函数需要返回一个对象的时候，如果自己创建一个临时对象用户返回，那么这个临时对象会消耗一个构造函数(Constructor)的调用、一个复制构造函数的调用(CopyConstructor)以及一个析构函数(Destructor)的调用的代价。

### 成员函数

### const修饰类

- const int a; // 常成员变量，只能在初始化列表中赋值
- void func1() const; // 常成员函数，不能修改成员变量
- const A* a; // 指向常对象的指针，不能通过该指针修改对象
- A* const a; // 常指针，指向的对象可以修改，指针不能修改
- const A& a; // 常引用，不能通过该引用修改对象
- const A* const a; // 常指针常量，不能通过该指针修改对象，指针不能修改

### static修饰类

- static成员变量
    1. 所有对象共享一个static成员变量
    2. static成员变量在类外定义
    3. static成员变量初始化时不能加const
- static成员函数
    1. 所有对象共享一个static成员函数
    2. static成员函数只能访问static成员变量和static成员函数

### 友元friend

- 友元函数
- 友元类

- 友元的作用是提高了程序的运行效率(即减少了类型和安全性检查及调用的时间开销)，它破坏了类的封装性和隐藏性，使得非成员函数可以访问类的私有成员。

- 友元函数终究不是成员函数，成员中有隐参 this 指针，可以直接访问成员，而友元中则没有，必须得通过对象来访问。
- 友元仅是打破了，外部访问中的 private 权限。声明为谁的友元，就可以通过谁的对象，访问谁的私有成员。

### 运算符重载

- 不能改变运算符的优先级和结合性
- 不能创建新的运算符
- 重载运算符的函数不能有默认的参数
- 某些运算符不能重载，比如::, ., ?:, sizeof, ?:, typeid, #, ##
- 运算符重载函数不能有默认参数

### 继承

#### 虚继承

## 多态

1. 父类中有虚函数，即共用接口。
2. 子类 override(覆写)父类中的虚函数。
3. 通过己被子类对象赋值的父类指针，调用共用接口。

### 虚函数

1. virtual 是声明虚函数的关键字，它是一个声明型关键字。
2. override 构成的条件，发生在父子类的继承关系中 同名，同参，同返回。
3. 虚函数在派生类中仍然为虚函数，若发生覆写，最好显示的标注 virtual。若无覆写，仍然为虚函数。
4. 子类中的覆写的函数，可以为任意访问类型，依子类需求决定。

### 纯虚函数

1. 纯虚函数只有声明，没有实现，被"初始化"为 0。
2. 含有纯虚函数的类，称为 Abstract Base Class(抽象基类)，不可实例化。即不能创建对象，存在的意义就是被继承，提供族类的公共接口，java 中称为 Interface。
3. 如果一个类中声明了纯虚函数，而在派生类中没有该函数的定义，则该虚函数在派生类中仍然为纯虚函数，派生类仍然为纯虚基类。

### 编译期多态

## 委托构造

## 模板

### 模板函数

```c++
#include <iostream>
#include <string>
 
using namespace std;
 
template <typename T>
inline T const& Max (T const& a, T const& b) 
{ 
    return a < b ? b:a; 
} 
int main ()
{
 
    int i = 39;
    int j = 20;
    cout << "Max(i, j): " << Max(i, j) << endl; 
 
    double f1 = 13.5; 
    double f2 = 20.7; 
    cout << "Max(f1, f2): " << Max(f1, f2) << endl; 
 
    string s1 = "Hello"; 
    string s2 = "World"; 
    cout << "Max(s1, s2): " << Max(s1, s2) << endl; 
 
    return 0;
}
```

### 模板类

```c++
#include <iostream>
#include <vector>
#include <cstdlib>
#include <string>
#include <stdexcept>
 
using namespace std;
 
template <class T>
class Stack { 
  private: 
    vector<T> elems;     // 元素 
 
  public: 
    void push(T const&);  // 入栈
    void pop();               // 出栈
    T top() const;            // 返回栈顶元素
    bool empty() const{       // 如果为空则返回真。
        return elems.empty(); 
    } 
}; 
 
template <class T>
void Stack<T>::push (T const& elem) 
{ 
    // 追加传入元素的副本
    elems.push_back(elem);    
} 
 
template <class T>
void Stack<T>::pop () 
{ 
    if (elems.empty()) { 
        throw out_of_range("Stack<>::pop(): empty stack"); 
    }
    // 删除最后一个元素
    elems.pop_back();         
} 
 
template <class T>
T Stack<T>::top () const 
{ 
    if (elems.empty()) { 
        throw out_of_range("Stack<>::top(): empty stack"); 
    }
    // 返回最后一个元素的副本 
    return elems.back();      
} 
 
int main() 
{ 
    try { 
        Stack<int>         intStack;  // int 类型的栈 
        Stack<string> stringStack;    // string 类型的栈 
 
        // 操作 int 类型的栈 
        intStack.push(7); 
        cout << intStack.top() <<endl; 
 
        // 操作 string 类型的栈 
        stringStack.push("hello"); 
        cout << stringStack.top() << std::endl; 
        stringStack.pop(); 
        stringStack.pop(); 
    } 
    catch (exception const& ex) { 
        cerr << "Exception: " << ex.what() <<endl; 
        return -1;
    } 
}
```

## 模板元编程

- 把计算过程用编译期的类型推导和类型匹配表达出来

### enable_if

- C++11 开始，标准库里有了一个叫 enable_if 的模板（定义在 里），可以用它来选择性地启用某个函数的重载

```c++
template <typename C, typename T>
enable_if_t<has_reserve<C>::value,void>
append(C& container, T* ptr, size_t size)
{
  container.reserve(container.size() + size);
  for (size_t i = 0; i < size; ++i) {
    container.push_back(ptr[i]);
  }
}

template <typename C, typename T>
enable_if_t<!has_reserve<C>::value, void>
append(C& container, T* ptr, size_t size)
{
  for (size_t i = 0; i < size; ++i) {
    container.push_back(ptr[i]);
  }
}
```

### void_t

### 函数模板

#### 模板泛化

### 类模板

### 模板特化

### 应用可变模板

- C++11 引入的一项新功能，使我们可以在模板参数里表达不定个数和类型的参数。
- 用于在通用工具模板中转发参数到另外一个函数
- 用于在递归的模板中表达通用的情况（另外会有至少一个模板特化来表达边界情况）

### tuple

## 常量表达式constexpr

- 一个 constexpr 变量是一个编译时完全确定的常数。
- 一个 constexpr 函数至少对于某一组实参可以在编译期间产生一个编译期常数

## 函数式编程

### C++98的函数对象 functor

### lambda表达式

### 泛型lambda表达式

### bind模板

### function模板

### 高阶函数

- sort
- transform
  - 把一个范围里的对象转换成相同数量的另外一些对象
- accumulate
  - 在指定的范围里，使用给定的初值和函数对象，从左到右对数值进行归并
- copy_if
  - 把满足条件的元素拷贝到另外一个迭代器里
- partition
  - 根据过滤条件来对范围里的元素进行分组，把满足条件的放在返回值迭代器的前面
- remove_if
  - 通常用于删除满足条件的元素。它确保把不满足条件的元素放在返回值迭代器的前面

## thread和future

## 内存模型和atomic

## 工具



## 单元测试



## qt

## STL

### vector

- 一般可以当作动态数组来用，类似Python中的list

### deque

### list

- 双向链表

### forward_list

- 前向链表

### queue

- 队列 先进先出

### stack

- 栈 后进先出

### priority_queue

### less

### greater

### hash

### 关联容器

#### set 集合

#### map 映射

#### multiset 多重集

#### multimap 多重映射

### 无序关联容器

#### unordered_set

#### unordered_map

#### unordered_multiset

#### unordered_multimap

### array

## 编码与字符集

## 数据结构与算法

## 常用库

### libevent

### boost

## 日志库

## 数字计算

### C++ REST SDK

## Concepts 模板约束

## Ranges

## coroutines 协程

## 虚拟内存

- 内存管理单元MMU和操作系统一起实现虚拟内存到物理内存之间的映射
  - 减少内存碎片
  - 简化运行条件
  - 隔离进程
  - 内存共享
  - SWAP
- 

## 汇编

> https://zh.cppreference.com/w/cpp