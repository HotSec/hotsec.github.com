# Boost 库教程

## 1. Boost 概述

Boost 是 C++ 最重要的高质量开源库集合，许多 Boost 库已成为 C++ 标准库的组成部分（如 smart_ptr、thread、filesystem、regex 等）。

### 1.1 Boost 与 C++ 标准的关系

| Boost 库 | C++ 标准引入 |
|----------|-------------|
| boost::shared_ptr | C++11 std::shared_ptr |
| boost::thread | C++11 std::thread |
| boost::filesystem | C++17 std::filesystem |
| boost::regex | C++11 std::regex |
| boost::optional | C++17 std::optional |
| boost::variant | C++17 std::variant |
| boost::any | C++17 std::any |
| boost::tuple | C++11 std::tuple |
| boost::array | C++11 std::array |
| boost::asio | C++23 std::execution（部分） |

### 1.2 安装

```bash
# macOS
brew install boost

# Ubuntu
sudo apt install libboost-all-dev

# vcpkg
vcpkg install boost

# 源码编译
./bootstrap.sh
./b2 -j4 install
```

### 1.3 CMake 集成

```cmake
find_package(Boost REQUIRED COMPONENTS filesystem system thread)

target_link_libraries(MyApp PRIVATE
    Boost::filesystem
    Boost::system
    Boost::thread
)

# 仅头文件库
find_package(Boost REQUIRED)
target_include_directories(MyApp PRIVATE ${Boost_INCLUDE_DIRS})
```

## 2. 智能指针（Smart Pointers）

Boost 智能指针是 C++11 标准智能指针的前身，在 C++11 之前广泛使用。

### 2.1 scoped_ptr / scoped_array

```cpp
#include <boost/scoped_ptr.hpp>
#include <boost/scoped_array.hpp>

void scopedPtrDemo() {
    boost::scoped_ptr<int> p(new int(42));
    std::cout << *p << std::endl;

    boost::scoped_array<int> arr(new int[10]);
    for (int i = 0; i < 10; i++) {
        arr[i] = i * i;
    }
}
```

### 2.2 shared_ptr / shared_array

```cpp
#include <boost/shared_ptr.hpp>
#include <boost/make_shared.hpp>

class Resource {
public:
    Resource(const std::string &name) : m_name(name) {
        std::cout << "Resource created: " << m_name << std::endl;
    }
    ~Resource() {
        std::cout << "Resource destroyed: " << m_name << std::endl;
    }
    void use() { std::cout << "Using: " << m_name << std::endl; }
private:
    std::string m_name;
};

void sharedPtrDemo() {
    boost::shared_ptr<Resource> p1 = boost::make_shared<Resource>("Res1");
    std::cout << "use_count: " << p1.use_count() << std::endl;

    {
        boost::shared_ptr<Resource> p2 = p1;
        std::cout << "use_count: " << p1.use_count() << std::endl;
        p2->use();
    }

    std::cout << "use_count: " << p1.use_count() << std::endl;
}

// 自定义删除器
void customDeleter() {
    auto deleter = [](FILE *f) {
        if (f) {
            std::cout << "Closing file" << std::endl;
            fclose(f);
        }
    };

    boost::shared_ptr<FILE> file(fopen("test.txt", "w"), deleter);
    if (file) {
        fprintf(file.get(), "Hello, Boost!");
    }
}
```

### 2.3 weak_ptr

```cpp
#include <boost/weak_ptr.hpp>

class Node {
public:
    boost::shared_ptr<Node> next;
    boost::weak_ptr<Node> prev;

    ~Node() { std::cout << "Node destroyed" << std::endl; }
};

void weakPtrDemo() {
    auto n1 = boost::make_shared<Node>();
    auto n2 = boost::make_shared<Node>();

    n1->next = n2;
    n2->prev = n1;

    if (auto locked = n2->prev.lock()) {
        std::cout << "Prev node exists" << std::endl;
    }
}
```

### 2.4 intrusive_ptr

```cpp
#include <boost/intrusive_ptr.hpp>

class RefCounted {
public:
    RefCounted() : m_refCount(0) {}
    virtual ~RefCounted() = default;

    friend void intrusive_ptr_add_ref(RefCounted *p) { ++p->m_refCount; }
    friend void intrusive_ptr_release(RefCounted *p) {
        if (--p->m_refCount == 0) delete p;
    }

    int refCount() const { return m_refCount; }

private:
    int m_refCount;
};

void intrusivePtrDemo() {
    boost::intrusive_ptr<RefCounted> p1(new RefCounted);
    std::cout << "ref: " << p1->refCount() << std::endl;

    boost::intrusive_ptr<RefCounted> p2 = p1;
    std::cout << "ref: " << p1->refCount() << std::endl;
}
```

## 3. 字符串处理

### 3.1 string_algo

```cpp
#include <boost/algorithm/string.hpp>

void stringAlgoDemo() {
    std::string s = "  Hello, Boost String Algorithms!  ";

    std::string trimmed = boost::trim_copy(s);
    boost::trim(s);

    std::string upper = boost::to_upper_copy(s);
    std::string lower = boost::to_lower_copy(s);

    std::string replaced = boost::replace_all_copy(s, "Boost", "C++");

    std::vector<std::string> parts;
    boost::split(parts, "one,two,three,four", boost::is_any_of(","));

    std::string joined = boost::join(parts, " | ");

    bool starts = boost::starts_with("Hello World", "Hello");
    bool ends = boost::ends_with("Hello World", "World");
    bool contains = boost::contains("Hello World", "llo");

    bool eq = boost::iequals("Hello", "HELLO");

    std::string erased = boost::erase_all_copy("Hello World", "l");

    std::string firstUpper = boost::to_upper_copy(boost::to_lower_copy(s).substr(0, 1))
                            + boost::to_lower_copy(s).substr(1);
}
```

### 3.2 format

```cpp
#include <boost/format.hpp>

void formatDemo() {
    std::string s1 = (boost::format("Hello, %s! You are %d years old.") % "World" % 25).str();

    std::string s2 = (boost::format("Positional: %1% %2% %1%") % "hello" % "world").str();

    std::cout << boost::format("%|05d|") % 42 << std::endl;
    std::cout << boost::format("%|10s|") % "left" << std::endl;
    std::cout << boost::format("%|-10s|") % "right" << std::endl;
    std::cout << boost::format("%.2f") % 3.14159 << std::endl;
}
```

### 3.3 lexical_cast

```cpp
#include <boost/lexical_cast.hpp>

void lexicalCastDemo() {
    int num = boost::lexical_cast<int>("42");
    double pi = boost::lexical_cast<double>("3.14159");
    std::string str = boost::lexical_cast<std::string>(3.14);

    try {
        int bad = boost::lexical_cast<int>("not a number");
    } catch (const boost::bad_lexical_cast &e) {
        std::cerr << "Cast failed: " << e.what() << std::endl;
    }
}
```

### 3.4 tokenizer

```cpp
#include <boost/tokenizer.hpp>

void tokenizerDemo() {
    std::string s = "This,is;a|test,string";

    boost::char_separator<char> sep(",;|");
    boost::tokenizer<boost::char_separator<char>> tokens(s, sep);
    for (const auto &token : tokens) {
        std::cout << token << std::endl;
    }

    boost::char_separator<char> sep2(",", "", boost::keep_empty_tokens);
    boost::tokenizer<boost::char_separator<char>> tokens2("a,,b,c", sep2);

    boost::escaped_list_separator<char> escSep;
    boost::tokenizer<boost::escaped_list_separator<char>> csvTokens("\"hello, world\",test", escSep);
}
```

## 4. 容器与数据结构

### 4.1 unordered（哈希容器）

```cpp
#include <boost/unordered_map.hpp>
#include <boost/unordered_set.hpp>

void unorderedDemo() {
    boost::unordered_map<std::string, int> ages;
    ages["Alice"] = 30;
    ages["Bob"] = 25;

    for (const auto &[name, age] : ages) {
        std::cout << name << ": " << age << std::endl;
    }

    boost::unordered_set<int> nums;
    nums.insert(1);
    nums.insert(2);
    nums.insert(3);
}
```

### 4.2 multi_index

```cpp
#include <boost/multi_index_container.hpp>
#include <boost/multi_index/ordered_index.hpp>
#include <boost/multi_index/hashed_index.hpp>
#include <boost/multi_index/identity.hpp>
#include <boost/multi_index/member.hpp>

struct Employee {
    int id;
    std::string name;
    int age;

    Employee(int i, const std::string &n, int a) : id(i), name(n), age(a) {}
};

struct id_tag {};
struct name_tag {};
struct age_tag {};

using EmployeeContainer = boost::multi_index::multi_index_container<
    Employee,
    boost::multi_index::indexed_by<
        boost::multi_index::ordered_unique<
            boost::multi_index::tag<id_tag>,
            boost::multi_index::member<Employee, int, &Employee::id>
        >,
        boost::multi_index::ordered_non_unique<
            boost::multi_index::tag<name_tag>,
            boost::multi_index::member<Employee, std::string, &Employee::name>
        >,
        boost::multi_index::ordered_non_unique<
            boost::multi_index::tag<age_tag>,
            boost::multi_index::member<Employee, int, &Employee::age>
        >
    >
>;

void multiIndexDemo() {
    EmployeeContainer employees;
    employees.insert(Employee(1, "Alice", 30));
    employees.insert(Employee(2, "Bob", 25));
    employees.insert(Employee(3, "Charlie", 30));

    auto &byId = employees.get<id_tag>();
    auto it = byId.find(2);
    if (it != byId.end()) {
        std::cout << "Found by ID: " << it->name << std::endl;
    }

    auto &byName = employees.get<name_tag>();
    auto range = byName.equal_range("Alice");

    auto &byAge = employees.get<age_tag>();
    for (auto it = byAge.lower_bound(25); it != byAge.upper_bound(30); ++it) {
        std::cout << it->name << " (age: " << it->age << ")" << std::endl;
    }
}
```

### 4.3 circular_buffer

```cpp
#include <boost/circular_buffer.hpp>

void circularBufferDemo() {
    boost::circular_buffer<int> cb(5);

    cb.push_back(1);
    cb.push_back(2);
    cb.push_back(3);
    cb.push_back(4);
    cb.push_back(5);

    cb.push_back(6);

    std::cout << "Front: " << cb.front() << std::endl;
    std::cout << "Back: " << cb.back() << std::endl;

    for (const auto &val : cb) {
        std::cout << val << " ";
    }
}
```

### 4.4 variant

```cpp
#include <boost/variant.hpp>

using Value = boost::variant<int, double, std::string>;

struct ValueVisitor : boost::static_visitor<void> {
    void operator()(int v) const { std::cout << "int: " << v << std::endl; }
    void operator()(double v) const { std::cout << "double: " << v << std::endl; }
    void operator()(const std::string &v) const { std::cout << "string: " << v << std::endl; }
};

void variantDemo() {
    Value v1 = 42;
    Value v2 = 3.14;
    Value v3 = std::string("hello");

    boost::apply_visitor(ValueVisitor(), v1);
    boost::apply_visitor(ValueVisitor(), v2);
    boost::apply_visitor(ValueVisitor(), v3);

    int *pi = boost::get<int>(&v1);
    if (pi) std::cout << "Got int: " << *pi << std::endl;

    try {
        double d = boost::get<double>(v1);
    } catch (const boost::bad_get &e) {
        std::cerr << "Bad get: " << e.what() << std::endl;
    }
}
```

### 4.5 any

```cpp
#include <boost/any.hpp>

void anyDemo() {
    boost::any a1 = 42;
    boost::any a2 = 3.14;
    boost::any a3 = std::string("hello");

    int val = boost::any_cast<int>(a1);

    int *ptr = boost::any_cast<int>(&a1);
    if (ptr) std::cout << *ptr << std::endl;

    if (a1.type() == typeid(int)) {
        std::cout << "a1 is int" << std::endl;
    }

    try {
        std::string s = boost::any_cast<std::string>(a1);
    } catch (const boost::bad_any_cast &e) {
        std::cerr << "Bad cast: " << e.what() << std::endl;
    }
}
```

## 5. 函数式编程

### 5.1 bind

```cpp
#include <boost/bind.hpp>

void bindDemo() {
    auto add = [](int a, int b) { return a + b; };

    auto add5 = boost::bind(add, 5, _1);
    std::cout << add5(3) << std::endl;

    auto addBoth = boost::bind(add, _1, _2);
    std::cout << addBoth(3, 4) << std::endl;

    std::vector<int> nums = {1, 2, 3, 4, 5};
    std::transform(nums.begin(), nums.end(), nums.begin(),
                   boost::bind(std::plus<int>(), _1, 10));

    std::vector<int> evens;
    std::copy_if(nums.begin(), nums.end(), std::back_inserter(evens),
                 boost::bind(std::modulus<int>(), _1, 2) == 0);
}
```

### 5.2 function

```cpp
#include <boost/function.hpp>

void functionDemo() {
    boost::function<int(int, int)> adder = [](int a, int b) { return a + b; };
    std::cout << adder(3, 4) << std::endl;

    boost::function<void(const std::string &)> logger;
    logger = [](const std::string &msg) {
        std::cout << "[LOG] " << msg << std::endl;
    };
    logger("Hello");

    logger = nullptr;
    if (!logger) {
        std::cout << "Logger is empty" << std::endl;
    }
}
```

### 5.3 signals2

```cpp
#include <boost/signals2.hpp>

void signals2Demo() {
    boost::signals2::signal<void(const std::string &)> messageSignal;

    auto conn1 = messageSignal.connect([](const std::string &msg) {
        std::cout << "Slot 1: " << msg << std::endl;
    });

    auto conn2 = messageSignal.connect([](const std::string &msg) {
        std::cout << "Slot 2: " << msg << std::endl;
    });

    messageSignal("Hello, Signals!");

    conn1.disconnect();

    messageSignal("After disconnect");

    boost::signals2::signal<int(int, int)> calcSignal;
    calcSignal.connect(0, [](int a, int b) { return a + b; });
    calcSignal.connect(1, [](int a, int b) { return a * b; });

    auto results = calcSignal(3, 4);
    for (auto r : results) {
        std::cout << "Result: " << r << std::endl;
    }
}
```

## 6. 并发编程

### 6.1 thread

```cpp
#include <boost/thread.hpp>
#include <boost/thread/future.hpp>

void threadDemo() {
    boost::thread t([]() {
        std::cout << "Hello from thread: " << boost::this_thread::get_id() << std::endl;
        boost::this_thread::sleep_for(boost::chrono::milliseconds(500));
    });
    t.join();

    std::vector<boost::thread> threads;
    for (int i = 0; i < 5; i++) {
        threads.emplace_back([i]() {
            std::cout << "Thread " << i << " running" << std::endl;
        });
    }
    for (auto &t : threads) {
        t.join();
    }
}
```

### 6.2 mutex 和 lock

```cpp
#include <boost/thread.hpp>
#include <boost/thread/lock_factories.hpp>

void mutexDemo() {
    boost::mutex mtx;
    int counter = 0;

    auto increment = [&]() {
        for (int i = 0; i < 1000; i++) {
            boost::lock_guard<boost::mutex> lock(mtx);
            counter++;
        }
    };

    boost::thread t1(increment);
    boost::thread t2(increment);
    t1.join();
    t2.join();

    std::cout << "Counter: " << counter << std::endl;

    boost::shared_mutex rwMtx;
    auto reader = [&]() {
        boost::shared_lock<boost::shared_mutex> lock(rwMtx);
    };
    auto writer = [&]() {
        boost::unique_lock<boost::shared_mutex> lock(rwMtx);
    };
}
```

### 6.3 future/promise

```cpp
#include <boost/thread/future.hpp>

void futureDemo() {
    boost::packaged_task<int> task([]() {
        boost::this_thread::sleep_for(boost::chrono::seconds(1));
        return 42;
    });

    boost::future<int> f = task.get_future();
    boost::thread t(std::move(task));

    std::cout << "Waiting..." << std::endl;
    f.wait();

    std::cout << "Result: " << f.get() << std::endl;
    t.join();

    auto f2 = boost::async([]() {
        boost::this_thread::sleep_for(boost::chrono::milliseconds(500));
        return std::string("async result");
    });

    std::cout << f2.get() << std::endl;

    boost::promise<int> p;
    boost::future<int> f3 = p.get_future();

    boost::thread producer([&p]() {
        boost::this_thread::sleep_for(boost::chrono::milliseconds(300));
        p.set_value(100);
    });

    std::cout << "Promise result: " << f3.get() << std::endl;
    producer.join();
}
```

## 7. 文件系统

### 7.1 filesystem

```cpp
#include <boost/filesystem.hpp>

namespace fs = boost::filesystem;

void filesystemDemo() {
    fs::path p = "/tmp/test_dir/subdir";

    if (!fs::exists(p)) {
        fs::create_directories(p);
    }

    fs::path filePath = p / "test.txt";
    std::ofstream(filePath.string()) << "Hello, Boost!";

    std::cout << "Exists: " << fs::exists(filePath) << std::endl;
    std::cout << "Is regular: " << fs::is_regular_file(filePath) << std::endl;
    std::cout << "File size: " << fs::file_size(filePath) << std::endl;

    std::cout << "Parent path: " << filePath.parent_path() << std::endl;
    std::cout << "Filename: " << filePath.filename() << std::endl;
    std::cout << "Stem: " << filePath.stem() << std::endl;
    std::cout << "Extension: " << filePath.extension() << std::endl;

    for (const auto &entry : fs::directory_iterator(p.parent_path())) {
        std::cout << entry.path() << std::endl;
    }

    for (const auto &entry : fs::recursive_directory_iterator("/tmp/test_dir")) {
        std::cout << entry.path();
        if (fs::is_directory(entry)) std::cout << "/";
        std::cout << std::endl;
    }

    fs::copy_file(filePath, p / "test_copy.txt");
    fs::rename(p / "test_copy.txt", p / "renamed.txt");
    fs::remove(p / "renamed.txt");
    fs::remove_all("/tmp/test_dir");
}
```

## 8. 序列化

### 8.1 基本序列化

```cpp
#include <boost/archive/text_oarchive.hpp>
#include <boost/archive/text_iarchive.hpp>
#include <boost/serialization/string.hpp>
#include <boost/serialization/vector.hpp>

class Person {
public:
    Person() = default;
    Person(const std::string &name, int age, const std::vector<std::string> &hobbies)
        : m_name(name), m_age(age), m_hobbies(hobbies) {}

    template<class Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & m_name;
        ar & m_age;
        ar & m_hobbies;
    }

    void print() const {
        std::cout << "Name: " << m_name << ", Age: " << m_age << std::endl;
        std::cout << "Hobbies: ";
        for (const auto &h : m_hobbies) std::cout << h << " ";
        std::cout << std::endl;
    }

private:
    std::string m_name;
    int m_age;
    std::vector<std::string> m_hobbies;
};

void serializationDemo() {
    Person p("Alice", 30, {"reading", "coding", "hiking"});

    {
        std::ofstream ofs("person.dat");
        boost::archive::text_oarchive oa(ofs);
        oa << p;
    }

    Person loaded;
    {
        std::ifstream ifs("person.dat");
        boost::archive::text_iarchive ia(ifs);
        ia >> loaded;
    }

    loaded.print();
}
```

### 8.2 XML 序列化

```cpp
#include <boost/archive/xml_oarchive.hpp>
#include <boost/archive/xml_iarchive.hpp>
#include <boost/serialization/nvp.hpp>

class Config {
public:
    template<class Archive>
    void serialize(Archive &ar, const unsigned int version) {
        ar & BOOST_SERIALIZATION_NVP(m_host);
        ar & BOOST_SERIALIZATION_NVP(m_port);
        ar & BOOST_SERIALIZATION_NVP(m_debug);
    }

    std::string m_host = "localhost";
    int m_port = 8080;
    bool m_debug = false;
};

void xmlSerializationDemo() {
    Config cfg;
    cfg.m_host = "example.com";
    cfg.m_port = 443;
    cfg.m_debug = true;

    {
        std::ofstream ofs("config.xml");
        boost::archive::xml_oarchive oa(ofs);
        oa << BOOST_SERIALIZATION_NVP(cfg);
    }

    Config loaded;
    {
        std::ifstream ifs("config.xml");
        boost::archive::xml_iarchive ia(ifs);
        ia >> BOOST_SERIALIZATION_NVP(loaded);
    }
}
```

## 9. 正则表达式

```cpp
#include <boost/regex.hpp>

void regexDemo() {
    std::string text = "Hello, my email is test@example.com and phone is 123-456-7890";

    boost::regex emailRegex(R"([\w.+-]+@[\w-]+\.[\w.]+)");
    boost::smatch matches;

    if (boost::regex_search(text, matches, emailRegex)) {
        std::cout << "Email: " << matches[0] << std::endl;
    }

    boost::regex phoneRegex(R"(\d{3}-\d{3}-\d{4})");
    std::string replaced = boost::regex_replace(text, phoneRegex, "XXX-XXX-XXXX");

    boost::regex numberRegex(R"(\d+)");
    boost::sregex_iterator begin(text.begin(), text.end(), numberRegex);
    boost::sregex_iterator end;
    for (auto it = begin; it != end; ++it) {
        std::cout << "Number: " << (*it)[0] << std::endl;
    }

    boost::regex pattern(R"(^Hello)");
    bool startsWithHello = boost::regex_search(text, pattern);
}
```

## 10. 日期时间

### 10.1 date_time

```cpp
#include <boost/date_time/gregorian/gregorian.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

namespace bg = boost::gregorian;
namespace bp = boost::posix_time;

void dateTimeDemo() {
    bg::date today = bg::day_clock::local_day();
    std::cout << "Today: " << today << std::endl;

    bg::date birthday(2000, 1, 15);
    bg::date_period period(birthday, today);
    std::cout << "Days since birthday: " << period.length().days() << std::endl;

    bg::date tomorrow = today + bg::days(1);
    bg::date nextWeek = today + bg::weeks(1);
    bg::date nextMonth = today + bg::months(1);

    bp::ptime now = bp::second_clock::local_time();
    std::cout << "Now: " << now << std::endl;

    bp::ptime startTime = bp::microsec_clock::local_time();

    bp::ptime endTime = bp::microsec_clock::local_time();
    bp::time_duration elapsed = endTime - startTime;
    std::cout << "Elapsed: " << elapsed.total_milliseconds() << " ms" << std::endl;

    bp::time_duration td(1, 30, 45, 0);
    std::cout << "Duration: " << td.hours() << "h "
              << td.minutes() << "m " << td.seconds() << "s" << std::endl;
}
```

## 11. 网络编程（Asio）

### 11.1 TCP 服务器

```cpp
#include <boost/asio.hpp>

namespace asio = boost::asio;
using asio::ip::tcp;

class TcpServer {
public:
    TcpServer(asio::io_context &ioContext, unsigned short port)
        : m_acceptor(ioContext, tcp::endpoint(tcp::v4(), port)) {
        startAccept();
    }

private:
    void startAccept() {
        auto socket = std::make_shared<tcp::socket>(m_acceptor.get_executor());
        m_acceptor.async_accept(*socket, [this, socket](boost::system::error_code ec) {
            if (!ec) {
                startRead(socket);
            }
            startAccept();
        });
    }

    void startRead(std::shared_ptr<tcp::socket> socket) {
        auto buffer = std::make_shared<std::array<char, 1024>>();
        socket->async_read_some(asio::buffer(*buffer),
            [this, socket, buffer](boost::system::error_code ec, std::size_t bytesTransferred) {
                if (!ec) {
                    std::string msg(buffer->data(), bytesTransferred);
                    std::cout << "Received: " << msg << std::endl;
                    startWrite(socket, "Echo: " + msg);
                }
            });
    }

    void startWrite(std::shared_ptr<tcp::socket> socket, const std::string &message) {
        auto msg = std::make_shared<std::string>(message);
        asio::async_write(*socket, asio::buffer(*msg),
            [socket, msg](boost::system::error_code ec, std::size_t) {
                if (!ec) {
                    startRead(socket);
                }
            });
    }

    tcp::acceptor m_acceptor;
};

void runTcpServer() {
    asio::io_context ioContext;
    TcpServer server(ioContext, 8080);
    ioContext.run();
}
```

### 11.2 TCP 客户端

```cpp
void tcpClient() {
    asio::io_context ioContext;

    tcp::resolver resolver(ioContext);
    auto endpoints = resolver.resolve("localhost", "8080");

    tcp::socket socket(ioContext);
    asio::connect(socket, endpoints);

    std::string message = "Hello from client!";
    asio::write(socket, asio::buffer(message));

    std::array<char, 1024> buffer;
    std::size_t len = socket.read_some(asio::buffer(buffer));
    std::cout << "Response: " << std::string(buffer.data(), len) << std::endl;
}
```

### 11.3 HTTP 客户端

```cpp
void httpClient() {
    asio::io_context ioContext;

    tcp::resolver resolver(ioContext);
    auto endpoints = resolver.resolve("example.com", "80");

    tcp::socket socket(ioContext);
    asio::connect(socket, endpoints);

    std::string request = "GET / HTTP/1.1\r\n"
                          "Host: example.com\r\n"
                          "Connection: close\r\n\r\n";
    asio::write(socket, asio::buffer(request));

    std::string response;
    boost::system::error_code ec;
    asio::read(socket, asio::dynamic_buffer(response), ec);

    std::cout << response << std::endl;
}
```

### 11.4 定时器

```cpp
void timerDemo() {
    asio::io_context ioContext;

    asio::steady_timer timer(ioContext, asio::chrono::seconds(3));
    timer.async_wait([](const boost::system::error_code &ec) {
        if (!ec) {
            std::cout << "Timer expired!" << std::endl;
        }
    });

    std::cout << "Waiting for timer..." << std::endl;
    ioContext.run();
}

void periodicTimer() {
    asio::io_context ioContext;
    auto timer = std::make_shared<asio::steady_timer>(ioContext);

    std::function<void()> handler;
    int count = 0;
    handler = [&]() {
        if (count >= 5) return;
        std::cout << "Tick " << count++ << std::endl;
        timer->expires_after(asio::chrono::seconds(1));
        timer->async_wait [&](const boost::system::error_code &) { handler(); });
    };

    handler();
    ioContext.run();
}
```

## 12. 其他实用库

### 12.1 program_options

```cpp
#include <boost/program_options.hpp>

namespace po = boost::program_options;

void programOptionsDemo(int argc, char *argv[]) {
    po::options_description desc("Allowed options");
    desc.add_options()
        ("help,h", "Show help message")
        ("config,c", po::value<std::string>()->default_value("config.json"), "Config file path")
        ("port,p", po::value<int>()->default_value(8080), "Server port")
        ("verbose,v", po::bool_switch()->default_value(false), "Verbose output")
        ("files", po::value<std::vector<std::string>>()->multitoken(), "Input files");

    po::variables_map vm;
    po::store(po::parse_command_line(argc, argv, desc), vm);
    po::notify(vm);

    if (vm.count("help")) {
        std::cout << desc << std::endl;
        return;
    }

    std::string config = vm["config"].as<std::string>();
    int port = vm["port"].as<int>();
    bool verbose = vm["verbose"].as<bool>();

    if (vm.count("files")) {
        auto files = vm["files"].as<std::vector<std::string>>();
    }
}
```

### 12.2 property_tree

```cpp
#include <boost/property_tree/ptree.hpp>
#include <boost/property_tree/json_parser.hpp>
#include <boost/property_tree/xml_parser.hpp>

namespace pt = boost::property_tree;

void propertyTreeDemo() {
    pt::ptree root;
    root.put("app.name", "MyApp");
    root.put("app.version", "1.0.0");
    root.put("app.debug", true);

    pt::ptree dbNode;
    dbNode.put("host", "localhost");
    dbNode.put("port", 3306);
    root.put_child("database", dbNode);

    pt::ptree features;
    pt::ptree f1; f1.put("", "feature1");
    pt::ptree f2; f2.put("", "feature2");
    features.push_back(std::make_pair("", f1));
    features.push_back(std::make_pair("", f2));
    root.put_child("features", features);

    pt::write_json("config.json", root);

    pt::ptree loaded;
    pt::read_json("config.json", loaded);

    std::string appName = loaded.get<std::string>("app.name");
    int dbPort = loaded.get<int>("database.port");
    bool debug = loaded.get<bool>("app.debug", false);

    for (const auto &[key, value] : loaded.get_child("features")) {
        std::cout << "Feature: " << value.get<std::string>("") << std::endl;
    }
}
```

### 12.3 optional

```cpp
#include <boost/optional.hpp>

boost::optional<int> findUserAge(const std::string &name) {
    if (name == "Alice") return 30;
    if (name == "Bob") return 25;
    return boost::none;
}

void optionalDemo() {
    auto age1 = findUserAge("Alice");
    if (age1) {
        std::cout << "Alice's age: " << *age1 << std::endl;
    }

    auto age2 = findUserAge("Unknown");
    int age = age2.value_or(0);
    std::cout << "Unknown's age: " << age << std::endl;
}
```

### 12.4 scope_exit

```cpp
#include <boost/scope_exit.hpp>

void scopeExitDemo() {
    FILE *file = fopen("test.txt", "w");
    BOOST_SCOPE_EXIT(&file) {
        if (file) fclose(file);
        std::cout << "File closed automatically" << std::endl;
    } BOOST_SCOPE_EXIT_END

    fprintf(file, "Hello, Scope Exit!");
}

void scopeExitWithCondition() {
    int *data = new int[100];
    bool success = false;

    BOOST_SCOPE_EXIT(&data, &success) {
        if (!success) {
            delete[] data;
            std::cout << "Cleanup on failure" << std::endl;
        }
    } BOOST_SCOPE_EXIT_END

    success = doSomething();
}
```

## 13. 面试题

### 1. Boost 和 C++ 标准库如何选择？

- **优先使用标准库**：如果标准库已有对应功能（如 std::shared_ptr、std::optional）
- **使用 Boost**：标准库尚未覆盖的功能（如 multi_index、signals2、asio 的完整版）
- **考虑编译依赖**：Boost 部分库需要编译链接，增加构建复杂度

### 2. shared_ptr 的线程安全性？

- **引用计数**：线程安全（原子操作）
- **对象访问**：非线程安全，需要外部同步
- **shared_ptr 本身**：多线程读安全，写需同步

### 3. Boost.Asio 的 proactor 模式？

1. 发起异步操作（如 async_read）
2. 操作完成时 OS 通知 completion queue
3. Asio 事件循环取出完成事件
4. 调用用户注册的回调函数

与 reactor 模式的区别：proactor 由 OS 完成操作后通知，reactor 由 OS 就绪后用户完成操作。

### 4. Boost 多索引容器的使用场景？

- 需要按多个字段查询同一数据集
- 替代维护多个关联容器
- 如：员工按 ID、姓名、年龄分别索引

### 5. Boost.Signals2 与回调函数的区别？

| 特性 | 回调函数 | Signals2 |
|------|----------|----------|
| 一对多 | 需手动管理 | 原生支持 |
| 连接管理 | 手动 | 自动 disconnect |
| 线程安全 | 需外部同步 | 可选线程安全 |
| 返回值 | 单一 | 合并器聚合 |
