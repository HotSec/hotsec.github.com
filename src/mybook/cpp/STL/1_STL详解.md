# C++ STL 详解

---

## 一、容器

### 1.1 序列容器

#### vector

```cpp
std::vector<int> v = {1, 2, 3};
v.push_back(4);
v.emplace_back(5); // 原地构造

v.size();    // 5
v.empty();   // false
v[0];        // 1 (无边界检查)
v.at(0);     // 1 (有边界检查)
v.front();   // 1
v.back();    // 5
v.data();    // 底层数组指针

v.reserve(100);    // 预分配容量
v.shrink_to_fit(); // 释放多余容量

// 删除
v.pop_back();
v.erase(v.begin() + 1);       // 删除第2个
v.erase(v.begin(), v.begin() + 3); // 删除前3个

// 删除满足条件的元素（erase-remove 惯用法）
v.erase(std::remove_if(v.begin(), v.end(),
    [](int x) { return x < 0; }), v.end());
```

#### list

```cpp
std::list<int> lst = {1, 2, 3};
lst.push_front(0);
lst.push_back(4);
lst.insert(std::next(lst.begin()), 10);

// O(1) 删除
lst.pop_front();
lst.pop_back();

// 排序（归并排序，稳定）
lst.sort();
lst.unique(); // 去重
lst.reverse();
lst.splice(lst2); // O(1) 转移元素
```

#### deque

```cpp
std::deque<int> dq = {1, 2, 3};
dq.push_front(0);  // O(1)
dq.push_back(4);   // O(1)
dq.pop_front();    // O(1)
dq.pop_back();     // O(1)
```

### 1.2 关联容器

#### set / map

```cpp
std::set<int> s = {3, 1, 4, 1, 5}; // {1, 3, 4, 5}
s.insert(2);
s.erase(3);
s.count(4);   // 0 或 1
s.find(4);    // 返回迭代器

std::map<std::string, int> m;
m["alice"] = 25;
m.insert({"bob", 30});
m.emplace("charlie", 35);

if (auto it = m.find("alice"); it != m.end()) {
    std::cout << it->second << "\n"; // 25
}

// 下界/上界
auto lb = m.lower_bound("bob"); // 第一个 >= "bob"
auto ub = m.upper_bound("bob"); // 第一个 > "bob"
```

#### multiset / multimap

```cpp
std::multiset<int> ms = {1, 2, 2, 3, 3, 3};
ms.count(3); // 3

std::multimap<std::string, int> mm;
mm.insert({"key", 1});
mm.insert({"key", 2});
auto range = mm.equal_range("key");
```

### 1.3 无序容器

```cpp
std::unordered_map<std::string, int> um;
um["key"] = 42;
um.insert({"key2", 100});

// 自定义哈希
struct MyHash {
    size_t operator()(const MyKey& k) const {
        return std::hash<std::string>()(k.name) ^ k.id;
    }
};
std::unordered_map<MyKey, int, MyHash> custom_map;
```

### 1.4 容器适配器

```cpp
std::stack<int> stk;
stk.push(1); stk.push(2); stk.push(3);
stk.top();  // 3
stk.pop();

std::queue<int> q;
q.push(1); q.push(2);
q.front(); // 1
q.back();  // 2
q.pop();

std::priority_queue<int> pq; // 默认最大堆
pq.push(3); pq.push(1); pq.push(4);
pq.top(); // 4

// 最小堆
std::priority_queue<int, std::vector<int>, std::greater<int>> min_pq;
```

---

## 二、算法

### 2.1 排序

```cpp
std::vector<int> v = {5, 2, 8, 1, 9, 3};

std::sort(v.begin(), v.end());                    // 升序
std::sort(v.begin(), v.end(), std::greater<>());  // 降序
std::stable_sort(v.begin(), v.end());             // 稳定排序
std::partial_sort(v.begin(), v.begin() + 3, v.end()); // 前3个有序
std::nth_element(v.begin(), v.begin() + 3, v.end());  // 第4小元素就位
```

### 2.2 查找

```cpp
// 二分查找（需有序）
std::binary_search(v.begin(), v.end(), 5);
std::lower_bound(v.begin(), v.end(), 5); // 第一个 >= 5
std::upper_bound(v.begin(), v.end(), 5); // 第一个 > 5

// 线性查找
std::find(v.begin(), v.end(), 5);
std::find_if(v.begin(), v.end(), [](int x) { return x > 5; });

// 计数
std::count(v.begin(), v.end(), 5);
std::count_if(v.begin(), v.end(), [](int x) { return x > 5; });

// 判断
std::any_of(v.begin(), v.end(), pred);  // 任一满足
std::all_of(v.begin(), v.end(), pred);  // 全部满足
std::none_of(v.begin(), v.end(), pred); // 全不满足
```

### 2.3 修改

```cpp
std::vector<int> v = {1, 2, 3, 4, 5};

std::transform(v.begin(), v.end(), v.begin(),
    [](int x) { return x * 2; }); // {2, 4, 6, 8, 10}

std::replace(v.begin(), v.end(), 4, 0); // 4 → 0
std::replace_if(v.begin(), v.end(), pred, 0);

std::fill(v.begin(), v.end(), 0);
std::iota(v.begin(), v.end(), 1); // {1, 2, 3, 4, 5}

std::reverse(v.begin(), v.end());
std::rotate(v.begin(), v.begin() + 2, v.end());

std::unique(v.begin(), v.end()); // 去重（需先排序）
```

### 2.4 数值

```cpp
int sum = std::accumulate(v.begin(), v.end(), 0);
int product = std::accumulate(v.begin(), v.end(), 1, std::multiplies<>());

// 内积
int dot = std::inner_product(v1.begin(), v1.end(), v2.begin(), 0);

// 部分和
std::partial_sum(v.begin(), v.end(), result.begin());

// 相邻差
std::adjacent_difference(v.begin(), v.end(), result.begin());
```

### 2.5 集合操作

```cpp
std::vector<int> a = {1, 2, 3, 4, 5};
std::vector<int> b = {3, 4, 5, 6, 7};
std::vector<int> result;

// 并集
std::set_union(a.begin(), a.end(), b.begin(), b.end(),
    std::back_inserter(result));

// 交集
std::set_intersection(a.begin(), a.end(), b.begin(), b.end(),
    std::back_inserter(result));

// 差集
std::set_difference(a.begin(), a.end(), b.begin(), b.end(),
    std::back_inserter(result));
```

---

## 三、迭代器

### 3.1 迭代器分类

| 类别 | 能力 | 示例容器 |
|------|------|----------|
| InputIterator | 只读，单遍 | istream_iterator |
| OutputIterator | 只写，单遍 | ostream_iterator |
| ForwardIterator | 读写，多遍 | forward_list |
| BidirectionalIterator | 双向 | list, map, set |
| RandomAccessIterator | 随机访问 | vector, deque |

### 3.2 迭代器适配器

```cpp
// 反向迭代器
for (auto it = v.rbegin(); it != v.rend(); ++it) {}

// 插入迭代器
std::copy(src.begin(), src.end(), std::back_inserter(dest));
std::copy(src.begin(), src.end(), std::front_inserter(dest));
std::copy(src.begin(), src.end(), std::inserter(dest, dest.begin()));

// 流迭代器
std::istream_iterator<int> it(std::cin);
std::istream_iterator<int> eos;
std::vector<int> v(it, eos);

std::ostream_iterator<int> out(std::cout, " ");
std::copy(v.begin(), v.end(), out);
```

### 3.3 迭代器失效

| 容器 | 插入 | 删除 |
|------|------|------|
| vector | 若扩容则全部失效 | 被删元素之后失效 |
| list | 不失效 | 仅被删元素失效 |
| map/set | 不失效 | 仅被删元素失效 |
| unordered_map | 若 rehash 则全部失效 | 仅被删元素失效 |

```cpp
// 安全删除
for (auto it = m.begin(); it != m.end(); ) {
    if (should_remove(it->second)) {
        it = m.erase(it); // C++11 返回下一个迭代器
    } else {
        ++it;
    }
}
```

---

## 四、函数对象

### 4.1 std::function

```cpp
std::function<int(int, int)> op;

op = [](int a, int b) { return a + b; };
op(3, 5); // 8

op = std::multiplies<int>();
op(3, 5); // 15
```

### 4.2 预定义函数对象

```cpp
std::plus<int>()       // a + b
std::minus<int>()      // a - b
std::multiplies<int>() // a * b
std::divides<int>()    // a / b
std::modulus<int>()    // a % b
std::negate<int>()     // -a

std::equal_to<int>()      // a == b
std::not_equal_to<int>()  // a != b
std::greater<int>()       // a > b
std::less<int>()          // a < b

std::logical_and<>()  // a && b
std::logical_or<>()   // a || b
std::logical_not<>()  // !a
```
