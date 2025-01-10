# C++

## 1. 基础

### 1.1. 常变量与数据类型

#### 1.1.1. 变量作用域

#### 1.1.2. 生命周期

#### 1.1.3. 修饰符

- auto
- register
- extern
- static

### 1.2. 程序流程控制

- for range

### 1.3. 运算符与表达式

### 1.4. 数组

### 1.5. 指针

- nullptr (C++11)

### 1.6. 引用

- 引用的本质是 const 类型的指针
- 引用与指针的区别

  1. 引用是对象的别名，指针是对象地址的别名
  2. 引用必须在创建时被初始化，指针可以在任何时候被初始化
  3. 引用一旦初始化，就不能改变引用的对象，指针可以随时改变引用的对象
  4. 引用不能为空，指针可以为空
  5. 引用是类型安全的，指针不是类型安全的
  6. 引用是隐式转换，指针是显式转换

### 1.7. 函数

- 函数重载
  1. 函数名相同
  2. 参数个数不同，参数的类型不同，参数顺序不同
  3. 返回值类型，不作为重载的标准
  4. C++ 允许， int 到 long 和 double， double 到 int 和 float, int 到 short 和 char等隐式类型转换。遇到这种情型，则会引起二义性。
- extern "C"
- 默认参数
- 内联函数

### 1.8. 函数重载

### 1.9. 字符串

- Raw String (C++11)   R"(字符串内容)"

### 1.10. 结构体

### 1.11. Union共用

### 1.12. Enum枚举

### 1.13. 类型转换

- static_cast
- reinterpret_cast
- dynamic_cast
- const_cast
  - `const_cast<type-id>(expression)`
    - type-id 必须是一个指针或引用类型，type-id 不能是 void
    - expression 必须是一个指针或引用类型，expression 的类型必须能转换成 type-id 的类型
  - const_cast 可以用来去掉 const 或 volatile 修饰符

### 1.14. 命名空间

### 1.15. 文件

### 1.16. 流

### 1.17. 位运算

### 1.18. 异常处理

- try
- catch
- throw
- execption类

### 1.19. 预处理

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

### 1.20. 动态库&&静态库

### 1.21. 信号处理

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

## 2. cgi

## 3. 内存管理

### 3.1. 堆

- new/delete
- malloc/free
- new/delete 与 malloc/free 的区别
  1. new/delete 是 C++ 的关键字，malloc/free 是 C 的库函数
  2. new/delete 可以自动计算对象的大小，malloc/free 需要手动计算对象的大小
  3. new/delete 可以自动调用对象的构造函数和析构函数，malloc/free 不能
  4. new/delete 返回的是对象的指针，malloc/free 返回的是 void 指针
  5. new/delete 可以抛出异常，malloc/free 不会抛出异常
- new[]/delete[]

### 3.2. 栈

- 函数内部声明的变量将占用栈内存
- 后进先出 LIFO
- 从高地址到低地址增长

### 3.3. RAII

- Resource Acquisition Is Initialization C++特有的资源管理方式，即资源获取即初始化，在构造函数中申请资源，在析构函数中释放资源，这样就可以保证在对象的生命周期内，资源始终被正确地管理。

## 4. 智能指针

- unique_ptr
- shared_ptr
- weak_ptr
- auto_ptr （C++11 废弃）

## 5. 移动语义

- 左值lvalue

  - 有标识符、可以取地址的表达式
  - 例如:
    - 变量、函数或数据成员的名字
    - 返回左值引用的表达式，如 `++x、x = 1 、cout << ' '`
    - 字符串字面值常量，如 `"hello"`
- 右值rvalue

  - 纯右值prvalue
    - 没有标识符、不可以取地址的表达式，一般也称称为临时对象
    - 例如:
      - 返回非引用类型的表达式，如 `x + 1、x++、make_shared<int>(42)`
      - 除字符串字面值常量外的常量，如 `1、1.0、true`
  - xvalue
    - 有名字的右值，一般也称称为将亡值
- 右值引用 `T&&`
- 参考图：![alt text](image/C++MAP/image.png)
- C++ 的规则是：一个临时对象会在包含这个临时对象的完整表达式估值完成后、按生成顺序的逆序被销毁，除非有生命周期延长发生
- std::move

## 6. 函数调用约定

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

## 7. 函数名修饰规则

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

## 8. 开发环境

### 8.1. vs

### 8.2. vsc

## 9. 类

### 9.1. 构造函数

### 9.2. 析构函数

### 9.3. 初始化参数列表(initializelist)

类成员初始化的顺序与初始化参数列表的顺序无关，与其声明的顺序有关。

### 9.4. this指针

### 9.5. 返回值优化

(具名)返回值优化((Name)Return Value Optimization，简称(N)RVO)，是这么一种优化机制：当函数需要返回一个对象的时候，如果自己创建一个临时对象用户返回，那么这个临时对象会消耗一个构造函数(Constructor)的调用、一个复制构造函数的调用(CopyConstructor)以及一个析构函数(Destructor)的调用的代价。

### 9.6. 成员函数

### 9.7. const修饰类

- const int a; // 常成员变量，只能在初始化列表中赋值
- void func1() const; // 常成员函数，不能修改成员变量
- const A* a; // 指向常对象的指针，不能通过该指针修改对象
- A* const a; // 常指针，指向的对象可以修改，指针不能修改
- const A& a; // 常引用，不能通过该引用修改对象
- const A* const a; // 常指针常量，不能通过该指针修改对象，指针不能修改

### 9.8. static修饰类

- static成员变量
  1. 所有对象共享一个static成员变量
  2. static成员变量在类外定义
  3. static成员变量初始化时不能加const
- static成员函数
  1. 所有对象共享一个static成员函数
  2. static成员函数只能访问static成员变量和static成员函数

### 9.9. 友元friend

- 友元函数
- 友元类
- 友元的作用是提高了程序的运行效率(即减少了类型和安全性检查及调用的时间开销)，它破坏了类的封装性和隐藏性，使得非成员函数可以访问类的私有成员。
- 友元函数终究不是成员函数，成员中有隐参 this 指针，可以直接访问成员，而友元中则没有，必须得通过对象来访问。
- 友元仅是打破了，外部访问中的 private 权限。声明为谁的友元，就可以通过谁的对象，访问谁的私有成员。

### 9.10. 运算符重载

- 不能改变运算符的优先级和结合性
- 不能创建新的运算符
- 重载运算符的函数不能有默认的参数
- 某些运算符不能重载，比如::, ., ?:, sizeof, ?:, typeid, #, ##
- 运算符重载函数不能有默认参数

### 9.11. 继承

#### 9.11.1. 虚继承

## 10. 多态

1. 父类中有虚函数，即共用接口。
2. 子类 override(覆写)父类中的虚函数。
3. 通过己被子类对象赋值的父类指针，调用共用接口。

### 10.1. 虚函数

1. virtual 是声明虚函数的关键字，它是一个声明型关键字。
2. override 构成的条件，发生在父子类的继承关系中 同名，同参，同返回。
3. 虚函数在派生类中仍然为虚函数，若发生覆写，最好显示的标注 virtual。若无覆写，仍然为虚函数。
4. 子类中的覆写的函数，可以为任意访问类型，依子类需求决定。

### 10.2. 纯虚函数

1. 纯虚函数只有声明，没有实现，被"初始化"为 0。
2. 含有纯虚函数的类，称为 Abstract Base Class(抽象基类)，不可实例化。即不能创建对象，存在的意义就是被继承，提供族类的公共接口，java 中称为 Interface。
3. 如果一个类中声明了纯虚函数，而在派生类中没有该函数的定义，则该虚函数在派生类中仍然为纯虚函数，派生类仍然为纯虚基类。

### 10.3. 编译期多态

## 11. 委托构造

## 12. 模板

### 12.1. 模板函数

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

### 12.2. 模板类

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

## 13. 模板元编程

- 把计算过程用编译期的类型推导和类型匹配表达出来

### 13.1. enable_if

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

### 13.2. void_t

### 13.3. 函数模板

#### 13.3.1. 模板泛化

### 13.4. 类模板

### 13.5. 模板特化

### 13.6. 应用可变模板

- C++11 引入的一项新功能，使我们可以在模板参数里表达不定个数和类型的参数。
- 用于在通用工具模板中转发参数到另外一个函数
- 用于在递归的模板中表达通用的情况（另外会有至少一个模板特化来表达边界情况）

### 13.7. tuple

## 14. 常量表达式constexpr

- 一个 constexpr 变量是一个编译时完全确定的常数。
- 一个 constexpr 函数至少对于某一组实参可以在编译期间产生一个编译期常数

## 15. 函数式编程

### 15.1. C++98的函数对象 functor

### 15.2. lambda表达式

### 15.3. 泛型lambda表达式

### 15.4. bind模板

### 15.5. function模板

### 15.6. 高阶函数

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

## 16. 并发

### 16.1. 线程管理

#### 16.1.1. 启动新线程

```cpp
#include <iostream>
#include <thread>

void threadFunction() {
    std::cout << "Hello from the thread!" << std::endl;
}

int main() {
    std::thread t(threadFunction); // 创建并启动线程

    // 等待线程结束
    t.join();

    return 0;
}
```

```cpp
void threadFunction(int n) {
    std::cout << "Number: " << n << std::endl;
}

int main() {
    std::thread t(threadFunction, 42); // 传递参数42给线程函数
    t.join();
    return 0;
}
```

#### 16.1.2. 线程所有权转移

#### 16.1.3. 线程管理

join()：主线程将等待子线程完成。
detach()：将线程从当前线程分离，使其独立运行。

### 16.2. 线程同步

#### 16.2.1. 互斥量（Mutexes）

- 互斥量是最基本的同步原语，用于确保同一时间只有一个线程可以访问共享资源。
- std::mutex：基本的互斥量类型。
- std::recursive_mutex：允许同一线程多次锁定互斥量。
- std::timed_mutex 和 std::recursive_timed_mutex：提供尝试锁定操作，可以设置超时。
- 使用示例：

```cpp
#include <mutex>

std::mutex mtx;

void shared_print(const std::string& msg, int id) {
    mtx.lock();
    // 临界区
    std::cout << msg << id << std::endl;
    mtx.unlock();
}
```

#### 16.2.2. 锁（Locks）

- 锁是互斥量的包装器，它们提供了更安全的锁定和解锁机制。
- std::lock_guard：构造时自动锁定互斥量，析构时自动解锁。
- std::unique_lock：提供了更多的灵活性，可以随时锁定和解锁。
- 使用示例：

```cpp
void shared_print(const std::string& msg, int id) {
    std::lock_guard<std::mutex> guard(mtx);
    std::cout << msg << id << std::endl;
}
```

#### 16.2.3. 条件变量（Condition Variables）

- 条件变量用于线程间的通知，一个线程可以等待某个条件成立。
- std::condition_variable：需要与互斥量一起使用。
- std::condition_variable_any：可以与任何互斥量兼容。
- 使用示例：

```cpp
#include <condition_variable>

std::mutex mtx;
std::condition_variable cv;
bool ready = false;

void threadFunction() {
    std::unique_lock<std::mutex> lck(mtx);
    cv.wait(lck, []{return ready;});
    // 执行操作
}

void signalFunction() {
    {
        std::lock_guard<std::mutex> lck(mtx);
        ready = true;
    }
    cv.notify_one();
}
```

### 16.3. 读写锁（Read-Write Locks）

- 读写锁允许多个线程同时读取共享资源，但写入时需要独占访问。
- std::shared_mutex：允许多个线程同时读取，但写入时互斥。
- std::shared_timed_mutex：带有超时功能的读写锁。
- 使用示例：

```cpp
#include <shared_mutex>

std::shared_mutex rw_mutex;

void readFunction() {
    std::shared_lock<std::shared_mutex> lck(rw_mutex);
    // 执行读取操作
}

void writeFunction() {
    std::unique_lock<std::shared_mutex> lck(rw_mutex);
    // 执行写入操作
}
```

#### 16.3.1. 原子操作（Atomic Operations）

- 原子操作可以在不使用锁的情况下保证操作的原子性。
- std::atomic：提供了原子类型，如 std::atomic `<int>`, std::atomic_flag。
- 使用示例：

```cpp
#include <atomic>

std::atomic<int> count(0);

void increment() {
    count.fetch_add(1, std::memory_order_relaxed);
}
```

#### 16.3.2. 屏障（Barriers）

- 屏障用于同步多个线程，以便它们在某个点上一起继续执行。
- std::barrier：C++20引入，允许线程在某个点同步。
- 使用示例：

```cpp
#include <barrier>

std::barrier sync_point(3); // 3个线程同步点

void threadFunction() {
    // 执行一些操作
    sync_point.arrive_and_wait();
    // 所有线程都到达同步点后继续执行
}
```

#### 16.3.3. std::latch

- std::latch 允许线程等待直到计数器达到零。它是一种一次性同步机制，一旦计数器达到零，std::latch 就无法再次使用。
- 常用成员函数
  - 构造函数：std::latch(std::ptrdiff_t count)，创建一个计数器为 count 的 latch。
  - count_down()：减少计数器的值。如果计数器变为零，将释放所有等待的线程。
  - count_down_and_wait()：减少计数器的值，并阻塞当前线程，直到计数器达到零。
  - wait()：阻塞当前线程，直到计数器达到零。
  - try_wait()：尝试阻塞当前线程，如果计数器已经为零，则立即返回 true，否则返回 false。
  - get_count()：返回当前计数器的值。

```cpp
#include <iostream>
#include <thread>
#include <latch>

std::latch latch(3); // 创建一个计数器为3的latch

void worker_thread() {
    // 模拟工作
    std::this_thread::sleep_for(std::chrono::seconds(1));
    std::cout << "Worker thread finished work.\n";
    latch.count_down(); // 完成工作，减少计数器
}

int main() {
    std::thread t1(worker_thread);
    std::thread t2(worker_thread);
    std::thread t3(worker_thread);

    // 等待所有线程完成工作
    latch.wait();

    std::cout << "All worker threads have finished.\n";

    t1.join();
    t2.join();
    t3.join();

    return 0;
}
```

#### 16.3.4. Futures和Promises

在 C++ 中，`std::future` 和 `std::promise` 是用于线程间通信的同步原语，它们通常一起使用来在单个或者多个线程之间传递结果或者异常。

##### 16.3.4.1. std::promise

`std::promise` 对象可以存储一个值或者一个异常，这个值或异常可以在将来的某个时刻通过与之关联的 `std::future` 对象获取。当你想要设置一个值或异常，以便另一个线程可以稍后检索它时，`std::promise` 非常有用。

##### 16.3.4.2. 主要成员函数：

* `get_future()`：返回一个与 `promise` 对象共享状态的 `future` 对象。
* `set_value(T value)`：设置共享状态的值。
* `set_exception(std::exception_ptr ex)`：设置共享状态的异常。
* `set_value_at_thread_exit(T value)`：设置共享状态的值，但是直到线程退出时才进行实际的设置操作。

##### 16.3.4.3. std::future

`std::future` 提供了一种访问异步操作结果的机制。它可以用来获取与 `std::promise` 相关联的值或异常。

###### 16.3.4.3.1. 主要成员函数：

* `get()`：阻塞当前线程，直到共享状态的值或异常可用，然后返回设置的值或重新抛出异常。
* `share()`：返回一个 `shared_future` 对象，它可以被多个线程共享。
* `valid()`：检查 `future` 是否有有效的共享状态。
* `wait()`：阻塞当前线程，直到共享状态的值或异常可用。
* `wait_for(duration)`：阻塞当前线程，直到共享状态的值或异常可用，或者超时。
* `wait_until(time_point)`：阻塞当前线程，直到共享状态的值或异常可用，或者到达指定的时间点。

##### 16.3.4.4. 示例

以下是一个使用 `std::promise` 和 `std::future` 的简单示例：

```cpp
#include <iostream>
#include <future>
#include <thread>

void calculateSum(std::promise<int> prom) {
    int sum = 0;
    for (int i = 0; i < 100; ++i) {
        sum += i;
    }
    prom.set_value(sum); // 设置结果
}

int main() {
    std::promise<int> prom;
    std::future<int> fut = prom.get_future();

    std::thread t(calculateSum, std::move(prom));

    // 主线程可以继续执行其他任务...

    // 获取结果
    int sum = fut.get();
    std::cout << "Sum is: " << sum << std::endl;

    t.join(); // 等待线程完成

    return 0;
}
```

在这个例子中，我们创建了一个 `std::promise` 对象，并将其传递给一个新线程。该线程执行计算并将结果通过 `set_value` 方法存储在 `promise` 中。主线程通过与之关联的 `std::future` 对象调用 `get()` 方法来获取结果。

### 16.4. 有锁的并发数据结构

#### 16.4.1. 选择合适的锁类型

C++ 提供了多种锁类型，包括：

* `std::mutex`：基本的互斥量，用于保护共享数据。
* `std::recursive_mutex`：允许同一线程多次锁定和解除锁定的互斥量。
* `std::timed_mutex` 和 `std::recursive_timed_mutex`：提供超时锁定功能。
* `std::shared_mutex`：允许多个读操作同时进行，但写操作需要独占访问。

#### 16.4.2. 确定锁的作用域和粒度

* **细粒度锁** ：每个数据元素都有自己的锁，可以提供更高的并发性，但可能导致复杂的锁管理。
* **粗粒度锁** ：整个数据结构只有一个锁，管理简单，但并发性较低。

#### 16.4.3. 设计原则

* **最小化锁的持有时间** ：尽量减少锁的持有时间，以减少线程等待时间。
* **避免死锁** ：确保锁的获取顺序一致，使用锁层次结构，或者使用 `std::lock` 来同时锁定多个锁。
* **不要在锁内调用未知代码** ：避免在持有锁的情况下调用可能抛出异常或长时间阻塞的函数。
* **提供无锁接口** ：如果可能，提供不需要锁的接口，例如只读操作。

#### 16.4.4. 示例：基于锁的线程安全队列

以下是一个简单的线程安全队列的实现，使用了 `std::mutex` 来保护数据结构：

```cpp
#include <mutex>
#include <queue>
#include <memory>

template<typename T>
class ThreadSafeQueue {
private:
    std::queue<T> queue;
    mutable std::mutex mutex;

public:
    ThreadSafeQueue() {}

    ThreadSafeQueue(const ThreadSafeQueue& other) {
        std::lock_guard<std::mutex> lock(other.mutex);
        queue = other.queue;
    }

    void push(T value) {
        std::lock_guard<std::mutex> lock(mutex);
        queue.push(std::move(value));
    }

    bool try_pop(T& value) {
        std::lock_guard<std::mutex> lock(mutex);
        if (queue.empty()) {
            return false;
        }
        value = std::move(queue.front());
        queue.pop();
        return true;
    }

    std::shared_ptr<T> try_pop() {
        std::lock_guard<std::mutex> lock(mutex);
        if (queue.empty()) {
            return nullptr;
        }
        std::shared_ptr<T> res(std::make_shared<T>(std::move(queue.front())));
        queue.pop();
        return res;
    }

    bool empty() const {
        std::lock_guard<std::mutex> lock(mutex);
        return queue.empty();
    }
};
```

在这个例子中，我们使用了 `std::mutex` 来保护队列的 `push`、`try_pop` 和 `empty` 操作。每个操作都在一个 `std::lock_guard` 的作用域内执行，这确保了在操作执行期间锁是被持有的，并且在作用域结束时自动释放锁。

### 16.5. 无锁的并发数据结构


在 C++ 中实现无锁（lock-free）的并发数据结构是一种高级技术，它依赖于原子操作来确保线程安全，而不需要传统的锁机制。无锁数据结构可以提供更高的并发性能，因为它们减少了线程因等待锁而阻塞的情况。以下是一些实现无锁数据结构的关键概念和示例。

#### 16.5.1. 关键概念

1. **原子操作** ：C++11 及以上版本提供了 `<atomic>` 头文件，其中包含了原子类型和原子操作，如 `std::atomic`、`std::atomic_flag`、`std::atomic_load`、`std::atomic_store`、`std::atomic_exchange` 等。
2. **内存模型** ：C++11 引入了内存模型，定义了多线程程序中的内存访问规则。了解数据依赖、内存顺序和同步操作对于实现无锁数据结构至关重要。
3. **比较并交换（CAS）操作** ：这是实现无锁数据结构的关键操作，通常通过 `std::atomic::compare_exchange_weak` 或 `std::atomic::compare_exchange_strong` 来实现。

#### 16.5.2. 示例：无锁栈

以下是一个简单的无锁栈的实现：

```cpp
#include <atomic>
#include <memory>

template<typename T>
class LockFreeStack {
private:
    struct Node {
        T data;
        std::atomic<Node*> next;
        Node(T data) : data(data), next(nullptr) {}
    };

    std::atomic<Node*> head;

public:
    LockFreeStack() : head(nullptr) {}

    ~LockFreeStack() {
        while (pop());
    }

    void push(T value) {
        Node* new_node = new Node(value);
        new_node->next.store(head.load(std::memory_order_relaxed), std::memory_order_relaxed);
        while (!head.compare_exchange_weak(new_node->next, new_node,
                                           std::memory_order_release,
                                           std::memory_order_relaxed));
    }

    bool pop(T& value) {
        Node* old_head = head.load(std::memory_order_relaxed);
        while (old_head != nullptr &&
               !head.compare_exchange_weak(old_head, old_head->next.load(std::memory_order_relaxed),
                                           std::memory_order_release,
                                           std::memory_order_relaxed));
        if (old_head == nullptr) {
            return false;
        }
        value = old_head->data;
        delete old_head;
        return true;
    }
};

```

在这个无锁栈的实现中，我们使用了 `std::atomic` 来存储栈顶指针。`push` 操作创建一个新节点，并尝试将其设置为新的栈顶，如果栈顶在尝试期间发生变化，它会重新尝试。`pop` 操作尝试移除栈顶节点，并返回其数据，如果栈为空或栈顶在尝试期间发生变化，它会重新尝试。

### 16.6. 注意事项

* **ABA 问题** ：无锁数据结构可能会遇到 ABA 问题，即一个节点被一个线程删除后，另一个线程又创建了一个相同地址的新节点。解决这个问题通常需要使用带有标记的指针（如 `std::atomic<T*>`）。
* **内存回收** ：在无锁数据结构中管理内存回收可能会很复杂，因为删除节点时不能简单地使用 `delete`，可能需要延迟删除或使用垃圾回收机制。
* **性能和复杂性** ：无锁数据结构的实现通常比基于锁的更复杂，并且可能不会在所有情况下都提供更好的性能。正确的实现和测试无锁数据结构需要深入理解并发编程和内存模型。

### 16.7. 并发设计

### 16.8. 线程池

### 16.9. 并行算法

### 16.10. 多线程调试

## 17. 内存模型和atomic

## 18. 工具

## 19. 单元测试

## 20. qt

## 21. STL

### 21.1. vector

- 一般可以当作动态数组来用，类似Python中的list

### 21.2. deque

### 21.3. list

- 双向链表

### 21.4. forward_list

- 前向链表

### 21.5. queue

- 队列 先进先出

### 21.6. stack

- 栈 后进先出

### 21.7. priority_queue

### 21.8. less

### 21.9. greater

### 21.10. hash

### 21.11. 关联容器

#### 21.11.1. set 集合

#### 21.11.2. map 映射

#### 21.11.3. multiset 多重集

#### 21.11.4. multimap 多重映射

### 21.12. 无序关联容器

#### 21.12.1. unordered_set

#### 21.12.2. unordered_map

#### 21.12.3. unordered_multiset

#### 21.12.4. unordered_multimap

### 21.13. array

## 22. 编码与字符集

## 23. 数据结构与算法

## 24. 常用库

### 24.1. libevent

### 24.2. boost

## 25. 日志库

## 26. 数字计算

### 26.1. C++ REST SDK

## 27. Concepts 模板约束

## 28. Ranges

## 29. coroutines 协程

## 30. 虚拟内存

- 内存管理单元MMU和操作系统一起实现虚拟内存到物理内存之间的映射
  - 减少内存碎片
  - 简化运行条件
  - 隔离进程
  - 内存共享
  - SWAP
- 内存分页
- 内存分段

## 31. 汇编

> https://zh.cppreference.com/w/cpp
