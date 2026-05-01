# Pandas 教程

## 安装与导入

```bash
pip install pandas
```

```python
import pandas as pd
import numpy as np
```

## Series

### 创建

```python
s = pd.Series([1, 2, 3, 4, 5])
s = pd.Series([1, 2, 3], index=["a", "b", "c"])
s = pd.Series({"a": 1, "b": 2, "c": 3})
s = pd.Series([1, 2, 3], dtype=np.float64)
s = pd.Series(5, index=["a", "b", "c"])
```

### 属性与操作

```python
s = pd.Series([10, 20, 30, 40, 50], index=["a", "b", "c", "d", "e"])

s.values
s.index
s.dtype
s.shape
s.size

s["a"]
s[["a", "c"]]
s[1:3]
s.iloc[1]
s.loc["b"]

s[s > 25]
s * 2
np.sqrt(s)
```

***

## DataFrame

### 创建

```python
df = pd.DataFrame({
    "name": ["Alice", "Bob", "Charlie"],
    "age": [25, 30, 35],
    "city": ["Beijing", "Shanghai", "Shenzhen"],
})

df = pd.DataFrame(
    [[1, 2, 3], [4, 5, 6], [7, 8, 9]],
    columns=["a", "b", "c"],
    index=["x", "y", "z"],
)

df = pd.DataFrame.from_dict({"name": ["Alice", "Bob"], "age": [25, 30]})
df = pd.DataFrame.from_records([{"name": "Alice", "age": 25}, {"name": "Bob", "age": 30}])
```

### 属性

```python
df.shape
df.columns
df.index
df.dtypes
df.info()
df.describe()
df.head(5)
df.tail(5)
df.memory_usage()
```

### 列操作

```python
df["name"]
df[["name", "age"]]
df.name

df["salary"] = [8000, 12000, 15000]
df["senior"] = df["age"] > 30
df = df.drop(columns=["senior"])
df = df.rename(columns={"name": "full_name"})

df["age_group"] = pd.cut(df["age"], bins=[0, 25, 35, 100], labels=["young", "mid", "senior"])
```

***

## 数据选择

### loc / iloc

```python
df.loc[0]
df.loc[0:2]
df.loc[0:2, "name"]
df.loc[0:2, ["name", "age"]]
df.loc[df["age"] > 28, ["name", "city"]]

df.iloc[0]
df.iloc[0:3]
df.iloc[0:3, 0:2]
df.iloc[[0, 2], [0, 2]]
```

### 条件选择

```python
df[df["age"] > 28]
df[(df["age"] > 25) & (df["city"] == "Beijing")]
df[df["city"].isin(["Beijing", "Shanghai"])]

df.query("age > 28")
df.query("age > 25 and city == 'Beijing'")
```

### 设置值

```python
df.loc[0, "age"] = 26
df.loc[df["age"] < 30, "category"] = "young"
df.iloc[0, 1] = 26
```

***

## 数据清洗

### 缺失值处理

```python
df = pd.DataFrame({
    "A": [1, np.nan, 3, np.nan, 5],
    "B": [10, 20, np.nan, 40, 50],
    "C": ["x", "y", np.nan, "z", "w"],
})

df.isnull()
df.isnull().sum()
df.isnull().sum(axis=1)
df.notnull()

df.dropna()
df.dropna(subset=["A"])
df.dropna(axis=1)
df.dropna(thresh=2)

df.fillna(0)
df["A"].fillna(df["A"].mean())
df["B"].fillna(method="ffill")
df["B"].fillna(method="bfill")
df.fillna({"A": 0, "C": "unknown"})
df.interpolate()
```

### 重复值处理

```python
df.duplicated()
df.duplicated(subset=["name"])
df.drop_duplicates()
df.drop_duplicates(subset=["name"], keep="last")
```

### 数据类型转换

```python
df["age"] = df["age"].astype(int)
df["date"] = pd.to_datetime(df["date"])
df["price"] = pd.to_numeric(df["price"], errors="coerce")

df["category"] = df["category"].astype("category")
```

### 字符串处理

```python
s = pd.Series(["  Hello  ", "WORLD", "foo bar"])

s.str.strip()
s.str.lower()
s.str.upper()
s.str.title()
s.str.replace("foo", "baz")
s.str.contains("hello", case=False)
s.str.startswith("Hello")
s.str.split(" ")
s.str.len()
s.str.extract(r"(\d+)")
```

***

## 分组聚合

### 基本分组

```python
df = pd.DataFrame({
    "dept": ["Eng", "Eng", "Sales", "Sales", "HR", "HR"],
    "name": ["Alice", "Bob", "Charlie", "David", "Eve", "Frank"],
    "salary": [15000, 18000, 12000, 14000, 10000, 11000],
    "age": [25, 30, 28, 35, 40, 32],
})

df.groupby("dept")["salary"].mean()
df.groupby("dept")["salary"].agg(["mean", "median", "std", "count"])
df.groupby("dept").agg({
    "salary": ["mean", "max"],
    "age": ["mean", "min"],
})
```

### 多级分组

```python
df.groupby(["dept", "name"])["salary"].sum()
df.groupby(["dept", "name"]).agg({"salary": "mean", "age": "max"})
```

### transform 与 filter

```python
df["dept_avg"] = df.groupby("dept")["salary"].transform("mean")
df["salary_diff"] = df["salary"] - df["dept_avg"]

dept_stats = df.groupby("dept").filter(lambda x: x["salary"].mean() > 12000)
```

### apply

```python
def top_earner(group):
    return group.loc[group["salary"].idxmax()]

df.groupby("dept").apply(top_earner)
```

### 透视表

```python
df.pivot_table(values="salary", index="dept", aggfunc="mean")
df.pivot_table(values="salary", index="dept", columns="name", aggfunc="sum", fill_value=0)
df.pivot_table(values=["salary", "age"], index="dept", aggfunc={"salary": "mean", "age": "max"})
```

### 交叉表

```python
pd.crosstab(df["dept"], df["age"] > 30)
pd.crosstab(df["dept"], df["age"] > 30, normalize="index")
```

***

## 合并与连接

### merge

```python
employees = pd.DataFrame({
    "emp_id": [1, 2, 3, 4],
    "name": ["Alice", "Bob", "Charlie", "David"],
    "dept_id": [101, 102, 101, 103],
})

departments = pd.DataFrame({
    "dept_id": [101, 102, 104],
    "dept_name": ["Engineering", "Sales", "Marketing"],
})

pd.merge(employees, departments, on="dept_id")
pd.merge(employees, departments, on="dept_id", how="left")
pd.merge(employees, departments, on="dept_id", how="right")
pd.merge(employees, departments, on="dept_id", how="outer")

pd.merge(employees, departments, left_on="dept_id", right_on="dept_id")
```

### join

```python
df1.set_index("dept_id").join(df2.set_index("dept_id"))
df1.set_index("dept_id").join(df2.set_index("dept_id"), how="left")
```

### concat

```python
pd.concat([df1, df2], axis=0, ignore_index=True)
pd.concat([df1, df2], axis=1)
pd.concat([df1, df2], keys=["first", "second"])
```

### combine_first

```python
df1.combine_first(df2)
```

***

## 时间序列

### 创建时间索引

```python
dates = pd.date_range("2024-01-01", periods=10, freq="D")
ts = pd.Series(np.random.randn(10), index=dates)

pd.date_range("2024-01-01", "2024-12-31", freq="MS")
pd.date_range("2024-01-01", periods=12, freq="ME")
pd.date_range("2024-01-01", periods=4, freq="QE")
pd.date_range("2024-01-01 09:00", periods=8, freq="4h")
```

### 时间操作

```python
df["date"] = pd.to_datetime(df["date_str"])
df = df.set_index("date")

df.index.year
df.index.month
df.index.day
df.index.dayofweek
df.index.quarter

df["2024"]
df["2024-01":"2024-03"]
df.loc["2024-01-15"]
```

### 重采样

```python
daily = df.resample("D").mean()
weekly = df.resample("W").sum()
monthly = df.resample("ME").agg({"price": "ohlc", "volume": "sum"})

df.resample("h").asfreq()
df.resample("h").ffill()
df.resample("h").interpolate()
```

### 滚动窗口

```python
df["ma_7"] = df["price"].rolling(window=7).mean()
df["ma_30"] = df["price"].rolling(window=30).mean()
df["std_7"] = df["price"].rolling(window=7).std()
df["ema_12"] = df["price"].ewm(span=12).mean()

df["shift_1"] = df["price"].shift(1)
df["diff_1"] = df["price"].diff(1)
df["pct_change"] = df["price"].pct_change()
```

***

## 文件 I/O

```python
df = pd.read_csv("data.csv", encoding="utf-8", index_col=0, parse_dates=["date"])
df.to_csv("output.csv", index=False, encoding="utf-8")

df = pd.read_excel("data.xlsx", sheet_name="Sheet1")
df.to_excel("output.xlsx", sheet_name="Sheet1", index=False)

df = pd.read_json("data.json", orient="records")
df.to_json("output.json", orient="records", force_ascii=False, indent=2)

df = pd.read_sql("SELECT * FROM users", con=engine)
df.to_sql("users", con=engine, if_exists="append", index=False)

df = pd.read_parquet("data.parquet")
df.to_parquet("output.parquet", compression="gzip")

df = pd.read_feather("data.feather")
df.to_feather("output.feather")
```

***

## 性能优化

### 数据类型优化

```python
df["category"] = df["category"].astype("category")
df["int_col"] = pd.to_numeric(df["int_col"], downcast="integer")
df["float_col"] = pd.to_numeric(df["float_col"], downcast="float")

df.memory_usage(deep=True)
df.info(memory_usage="deep")
```

### 向量化操作

```python
df["total"] = df["price"] * df["quantity"]

df["level"] = np.where(df["score"] >= 90, "A",
              np.where(df["score"] >= 80, "B",
              np.where(df["score"] >= 70, "C", "D")))

conditions = [
    df["age"] < 25,
    (df["age"] >= 25) & (df["age"] < 35),
    df["age"] >= 35,
]
choices = ["young", "mid", "senior"]
df["age_group"] = np.select(conditions, choices, default="unknown")
```

### eval 加速

```python
result = df.eval("total = price * quantity + tax", inplace=False)
mask = df.eval("age > 25 and salary > 10000")
```

### 大文件处理

```python
chunks = pd.read_csv("large.csv", chunksize=10000)
results = []
for chunk in chunks:
    results.append(chunk.groupby("category")["value"].sum())
total = pd.concat(results).groupby(level=0).sum()
```
