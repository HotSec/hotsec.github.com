# Polars 教程

## 概述

Polars 是用 Rust 编写的高性能 DataFrame 库，相比 Pandas 具有以下优势：

- **性能**：多线程并行 + 惰性计算
- **内存**：Apache Arrow 内存格式，零拷贝
- **API**：表达式 API，更一致、更安全
- **类型**：强类型系统，null 值语义清晰

```bash
pip install polars
```

```python
import polars as pl
```

## Series 与 DataFrame

### 创建

```python
s = pl.Series("name", ["Alice", "Bob", "Charlie"])
s = pl.Series("values", [1, 2, 3, 4, 5], dtype=pl.Int64)

df = pl.DataFrame({
    "name": ["Alice", "Bob", "Charlie", "David"],
    "age": [25, 30, 35, 28],
    "city": ["Beijing", "Shanghai", "Shenzhen", "Hangzhou"],
    "salary": [15000, 18000, 12000, 14000],
})

df = pl.DataFrame(
    [
        pl.Series("name", ["Alice", "Bob"]),
        pl.Series("age", [25, 30], dtype=pl.Int32),
    ]
)
```

### 属性

```python
df.shape
df.columns
df.dtypes
df.schema
df.height
df.width
df.describe()
df.head(5)
df.tail(5)
df.glimpse()
```

***

## 表达式 API

### 选择与过滤

```python
df.select("name", "age")
df.select(pl.col("name"), pl.col("age"))
df.select(pl.col(["name", "age"]))
df.select(pl.all())
df.select(pl.exclude("salary"))

df.filter(pl.col("age") > 28)
df.filter((pl.col("age") > 25) & (pl.col("city") == "Beijing"))
df.filter(pl.col("city").is_in(["Beijing", "Shanghai"]))
df.filter(pl.col("name").str.contains("li"))
```

### 列操作

```python
df = df.with_columns(
    pl.col("salary").alias("income"),
    (pl.col("salary") * 1.1).alias("raised_salary"),
    pl.col("age").cast(pl.Float64).alias("age_float"),
)

df = df.with_columns(
    senior=pl.when(pl.col("age") > 30).then(pl.lit(True)).otherwise(pl.lit(False)),
    age_group=pl.when(pl.col("age") < 25).then(pl.lit("young"))
                .when(pl.col("age") < 35).then(pl.lit("mid"))
                .otherwise(pl.lit("senior")),
)

df = df.rename({"name": "full_name"})
df = df.drop("age_float")
```

### 字符串操作

```python
df.select(
    pl.col("name").str.to_uppercase().alias("upper"),
    pl.col("name").str.to_lowercase().alias("lower"),
    pl.col("name").str.strip_chars().alias("stripped"),
    pl.col("name").str.contains("li").alias("has_li"),
    pl.col("name").str.starts_with("A").alias("starts_a"),
    pl.col("name").str.slice(0, 3).alias("first3"),
    pl.col("name").str.replace("li", "LI").alias("replaced"),
    pl.col("name").str.len_chars().alias("name_len"),
)
```

### 日期时间操作

```python
df = df.with_columns(
    pl.col("date").str.to_datetime("%Y-%m-%d").alias("dt"),
)

df.select(
    pl.col("dt").dt.year().alias("year"),
    pl.col("dt").dt.month().alias("month"),
    pl.col("dt").dt.day().alias("day"),
    pl.col("dt").dt.weekday().alias("weekday"),
    pl.col("dt").dt.hour().alias("hour"),
    pl.col("dt").dt.strftime("%Y-%m").alias("ym"),
)
```

***

## 分组聚合

### 基本聚合

```python
df.group_by("city").agg(
    pl.col("salary").mean().alias("avg_salary"),
    pl.col("salary").median().alias("median_salary"),
    pl.col("salary").sum().alias("total_salary"),
    pl.col("name").count().alias("headcount"),
    pl.col("age").min().alias("youngest"),
    pl.col("age").max().alias("oldest"),
)
```

### 多级分组

```python
df.group_by(["city", "age_group"]).agg(
    pl.col("salary").mean().alias("avg_salary"),
    pl.col("name").count().alias("count"),
)
```

### 高级聚合

```python
df.group_by("city").agg(
    pl.col("name"),
    pl.col("salary").alias("salaries"),
)

df.group_by("city").agg(
    pl.col("salary").quantile(0.25).alias("q25"),
    pl.col("salary").quantile(0.75).alias("q75"),
    pl.col("salary").std().alias("std"),
    pl.col("salary").var().alias("var"),
    (pl.col("salary").max() - pl.col("salary").min()).alias("range"),
)
```

### 窗口函数

```python
df = df.with_columns(
    pl.col("salary").mean().over("city").alias("city_avg"),
    pl.col("salary").rank("dense").over("city").alias("city_rank"),
    (pl.col("salary") - pl.col("salary").mean().over("city")).alias("salary_diff"),
)
```

***

## 连接

```python
employees = pl.DataFrame({
    "emp_id": [1, 2, 3, 4],
    "name": ["Alice", "Bob", "Charlie", "David"],
    "dept_id": [101, 102, 101, 103],
})

departments = pl.DataFrame({
    "dept_id": [101, 102, 104],
    "dept_name": ["Engineering", "Sales", "Marketing"],
})

employees.join(departments, on="dept_id", how="inner")
employees.join(departments, on="dept_id", how="left")
employees.join(departments, on="dept_id", how="outer")
employees.join(departments, on="dept_id", how="cross")

employees.join_where(
    departments,
    pl.col("dept_id") == pl.col("dept_id_right"),
)
```

### 拼接

```python
pl.concat([df1, df2], how="vertical")
pl.concat([df1, df2], how="vertical_relaxed")
pl.concat([df1, df2], how="horizontal")
pl.concat([df1, df2], how="diagonal")
```

***

## 数据清洗

### 缺失值

```python
df.null_count()
df.select(pl.all().is_null().sum())

df.drop_nulls()
df.drop_nulls(subset=["age"])

df.fill_null(0)
df.fill_null(strategy="forward")
df.fill_null(strategy="backward")
df.fill_null(strategy="mean")
df.with_columns(
    pl.col("age").fill_null(pl.col("age").mean()),
    pl.col("city").fill_null("Unknown"),
)
```

### 去重

```python
df.unique()
df.unique(subset=["name"])
df.unique(subset=["name"], keep="last")
```

### 类型转换

```python
df = df.cast({"age": pl.Int32, "salary": pl.Float64})
df = df.with_columns(
    pl.col("age").cast(pl.Int32),
    pl.col("date").str.to_datetime("%Y-%m-%d"),
)
```

***

## 惰性计算 (Lazy API)

### 基本用法

```python
lf = pl.scan_csv("large_data.csv")

result = (
    lf
    .filter(pl.col("age") > 25)
    .group_by("city")
    .agg(pl.col("salary").mean().alias("avg_salary"))
    .sort("avg_salary", descending=True)
    .limit(10)
)

print(result.explain())

df = result.collect()
```

### 惰性 vs 即时

```python
df_eager = pl.read_csv("data.csv").filter(pl.col("age") > 25).group_by("city").agg(pl.col("salary").mean())

df_lazy = (
    pl.scan_csv("data.csv")
    .filter(pl.col("age") > 25)
    .group_by("city")
    .agg(pl.col("salary").mean())
    .collect()
)
```

### 查询优化

```python
result = (
    pl.scan_parquet("data.parquet")
    .select("city", "salary", "age")
    .filter(pl.col("age") > 25)
    .group_by("city")
    .agg(pl.col("salary").mean())
)

print(result.explain())
print(result.profile())
result.collect()
```

### 流式处理

```python
result = (
    pl.scan_csv("very_large.csv")
    .filter(pl.col("value") > 0)
    .group_by("category")
    .agg(pl.col("value").sum())
    .collect(streaming=True)
)
```

***

## 文件 I/O

```python
df = pl.read_csv("data.csv", encoding="utf-8", try_parse_dates=True)
df.write_csv("output.csv")

df = pl.read_parquet("data.parquet")
df.write_parquet("output.parquet", compression="zstd")

df = pl.read_json("data.json")
df.write_json("output.json")

df = pl.scan_csv("data.csv")
df = pl.scan_parquet("data.parquet")

df = pl.read_database("SELECT * FROM users", connection_uri="postgresql://...")
df.write_database("users", connection_uri="postgresql://...", if_table_exists="append")
```

***

## Polars vs Pandas 对比

| 特性 | Pandas | Polars |
|------|--------|--------|
| 语言 | Python (C) | Rust |
| 并行 | 单线程 | 多线程 |
| 惰性计算 | 无 | 原生支持 |
| 内存格式 | NumPy | Apache Arrow |
| null 处理 | NaN + None | 统一 null |
| 类型系统 | 动态 | 强类型 |
| API 风格 | 命令式 | 表达式 |
| 大数据 | 需分块 | 流式处理 |

### 常用操作对照

```python
# Pandas
df[df["age"] > 25]["salary"].mean()

# Polars
df.filter(pl.col("age") > 25).select(pl.col("salary").mean())

# Pandas
df.groupby("city")["salary"].agg(["mean", "count"])

# Polars
df.group_by("city").agg(
    pl.col("salary").mean().alias("mean"),
    pl.col("salary").count().alias("count"),
)

# Pandas
df["new"] = df["a"] + df["b"]

# Polars
df.with_columns((pl.col("a") + pl.col("b")).alias("new"))

# Pandas
pd.merge(df1, df2, on="key", how="left")

# Polars
df1.join(df2, on="key", how="left")
```
