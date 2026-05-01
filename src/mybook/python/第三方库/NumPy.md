# NumPy 教程

## 安装与导入

```bash
pip install numpy
```

```python
import numpy as np
```

## ndarray 基础

### 创建数组

```python
a = np.array([1, 2, 3, 4])
b = np.array([[1, 2], [3, 4]])
c = np.array([1, 2, 3], dtype=np.float64)

np.zeros((3, 4))
np.ones((2, 3, 4))
np.empty((2, 3))
np.full((3, 3), 7)

np.arange(0, 10, 2)
np.linspace(0, 1, 5)
np.logspace(0, 3, 4)

np.eye(3)
np.diag([1, 2, 3])

np.random.rand(3, 4)
np.random.randn(3, 4)
np.random.randint(0, 10, size=(3, 4))
rng = np.random.default_rng(42)
rng.random((3, 4))
```

### 数组属性

```python
a = np.array([[1, 2, 3], [4, 5, 6]])

a.ndim
a.shape
a.size
a.dtype
a.itemsize
a.nbytes
a.T
```

### 数据类型

```python
np.array([1, 2, 3], dtype=np.int32)
np.array([1, 2, 3], dtype=np.float64)
np.array([1, 2, 3], dtype=np.complex128)
np.array([True, False], dtype=np.bool_)
np.array(["hello", "world"], dtype=np.str_)

a = np.array([1.1, 2.2, 3.3])
a.astype(np.int32)
a.astype(np.float16)
```

***

## 索引与切片

### 基本索引

```python
a = np.arange(10)

a[5]
a[-1]
a[2:7]
a[::2]
a[::-1]
a[2:8:3]
```

### 多维索引

```python
b = np.array([[1, 2, 3], [4, 5, 6], [7, 8, 9]])

b[0, 1]
b[1, :]
b[:, 2]
b[0:2, 1:3]
b[-1, -1]
```

### 花式索引

```python
a = np.arange(12).reshape(3, 4)

a[[0, 2]]
a[:, [1, 3]]
a[[0, 2], [1, 3]]

rows = np.array([0, 1, 2])
cols = np.array([1, 3, 0])
a[rows, cols]
```

### 布尔索引

```python
a = np.array([1, 2, 3, 4, 5, 6, 7, 8])

mask = a > 4
a[mask]
a[a % 2 == 0]
a[(a > 2) & (a < 7)]
a[~(a > 5)]

a[a > 5] = 0
```

### 视图与副本

```python
a = np.arange(6)
b = a[2:5]
b[:] = 0
print(a)

c = a[2:5].copy()
c[:] = 99
print(a)
```

***

## 形状操作

### reshape

```python
a = np.arange(12)

a.reshape(3, 4)
a.reshape(2, 6)
a.reshape(3, -1)
a.reshape(-1, 4)

a.reshape(2, 2, 3)
a.reshape(2, 2, 3).reshape(12)
a.flatten()
a.ravel()
a[np.newaxis, :]
a[:, np.newaxis]
```

### 转置与轴交换

```python
b = np.arange(12).reshape(3, 4)

b.T
b.transpose()
b.swapaxes(0, 1)

c = np.arange(24).reshape(2, 3, 4)
c.transpose(2, 0, 1).shape
c.swapaxes(0, 2).shape
```

### 拼接与分割

```python
a = np.array([1, 2, 3])
b = np.array([4, 5, 6])

np.concatenate([a, b])
np.stack([a, b])
np.vstack([a, b])
np.hstack([a, b])
np.dstack([a, b])

m = np.arange(12).reshape(3, 4)
np.split(m, 3, axis=0)
np.hsplit(m, 2)
np.vsplit(m, 3)
np.array_split(m, 4, axis=1)
```

***

## 通用函数 (ufunc)

### 数学运算

```python
a = np.array([1, 2, 3, 4, 5])

np.add(a, 10)
np.subtract(a, 1)
np.multiply(a, 3)
np.divide(a, 2)
np.floor_divide(a, 2)
np.power(a, 2)
np.mod(a, 3)

np.sqrt(a)
np.exp(a)
np.log(a)
np.log2(a)
np.log10(a)

np.abs(a)
np.sign(a)
np.ceil(np.array([1.2, 2.7, -0.3]))
np.floor(np.array([1.2, 2.7, -0.3]))
np.round(np.array([1.234, 2.567]), decimals=2)
```

### 三角函数

```python
angles = np.array([0, np.pi/6, np.pi/4, np.pi/3, np.pi/2])

np.sin(angles)
np.cos(angles)
np.tan(angles)

np.arcsin(np.array([0, 0.5, 1.0]))
np.degrees(angles)
np.radians(np.array([0, 30, 45, 90]))
```

### 统计函数

```python
a = np.array([3, 1, 4, 1, 5, 9, 2, 6])

np.sum(a)
np.mean(a)
np.median(a)
np.std(a)
np.var(a)
np.min(a)
np.max(a)
np.argmin(a)
np.argmax(a)
np.percentile(a, [25, 50, 75])
np.cumsum(a)
np.cumprod(a)
np.diff(a)
np.unique(a)

b = np.random.randn(3, 4)
np.sum(b, axis=0)
np.mean(b, axis=1)
np.max(b, axis=1, keepdims=True)
```

***

## 广播机制

### 规则

1. 两个数组维度从右向左比较
2. 维度相等或其中一个为 1，则兼容
3. 缺失维度视为 1

```python
a = np.array([[1, 2, 3], [4, 5, 6]])
b = np.array([10, 20, 30])
a + b

c = np.array([[1], [2]])
a + c

d = np.array([100])
a + d
```

### 广播示例

```python
x = np.arange(3).reshape(3, 1)
y = np.arange(3).reshape(1, 3)
x + y

data = np.random.randn(10, 5)
mean = data.mean(axis=0)
std = data.std(axis=0)
normalized = (data - mean) / std

distances = np.sqrt((x**2).sum(axis=1, keepdims=True) + (y**2).sum(axis=0) - 2 * x @ y)
```

***

## 线性代数

```python
A = np.array([[1, 2], [3, 4]])
B = np.array([[5, 6], [7, 8]])

A @ B
np.dot(A, B)
A.dot(B)

np.linalg.det(A)
np.linalg.inv(A)
A @ np.linalg.inv(A)

np.linalg.matrix_rank(A)

eigvals, eigvecs = np.linalg.eig(A)

U, s, Vt = np.linalg.svd(A)

x = np.linalg.solve(A, np.array([1, 2]))

norms = np.linalg.norm(A, axis=1)
```

***

## 文件 I/O

```python
a = np.arange(12).reshape(3, 4)

np.save("array.npy", a)
b = np.load("array.npy")

np.savez("arrays.npz", x=a, y=b)
data = np.load("arrays.npz")
data["x"]
data["y"]

np.savetxt("data.csv", a, delimiter=",", fmt="%d")
c = np.loadtxt("data.csv", delimiter=",", dtype=int)

np.genfromtxt("data.csv", delimiter=",", skip_header=1, filling_values=0)
```

***

## 性能优化

### 向量化 vs 循环

```python
import time

n = 1_000_000
a = np.random.randn(n)
b = np.random.randn(n)

start = time.perf_counter()
c = a + b
print(f"Vectorized: {time.perf_counter() - start:.4f}s")

start = time.perf_counter()
c = np.empty(n)
for i in range(n):
    c[i] = a[i] + b[i]
print(f"Loop: {time.perf_counter() - start:.4f}s")
```

### 内存布局

```python
a = np.arange(12).reshape(3, 4)
a.flags

b = np.ascontiguousarray(a)
c = np.asfortranarray(a)

a_c = a.copy(order="C")
a_f = a.copy(order="F")
```

### 避免不必要的拷贝

```python
a = np.random.randn(1000, 1000)

b = a * 2
b = np.multiply(a, 2, out=b)

np.add(a, 1, out=a)
```

### 使用 numexpr 加速

```python
import numexpr as ne

a = np.random.randn(10_000_000)
b = np.random.randn(10_000_000)

result = ne.evaluate("a**2 + b**2 + 2*a*b")
```
