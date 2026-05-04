# Python 风格指南

基于 Google Python Style Guide 的核心要点。

## 语言规则

### Pylint

使用 pylint 检查代码质量，消除所有警告。

```bash
pip install pylint
pylint mymodule.py
```

常见规则：
- `C`（Convention）：命名规范
- `R`（Refactor）：代码重构建议
- `W`（Warning）：潜在问题
- `E`（Error）：确定会出错

### 导入

```python
# 正确：每行一个导入
import os
import sys

# 错误：多个导入在一行
import os, sys

# 导入顺序：标准库 → 第三方库 → 本地模块
import os
import sys

import numpy as np
import requests

from mypackage import mymodule
```

### 装饰器

审慎使用装饰器，避免过度抽象。

```python
# 推荐：简单的装饰器
def log_call(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        return func(*args, **kwargs)
    return wrapper

# 避免 staticmethod，使用模块级函数替代
# 减少 classmethod，优先考虑实例方法
```

### 避免威力过大的功能

- 避免 `exec()` / `eval()`（安全风险）
- 避免动态修改 `__dict__`
- 避免元类（metaclass）除非确有必要
- 避免 `*args` / `**kwargs` 过度使用

### `__future__` 导入

在旧版本运行时启用新语法：

```python
from __future__ import annotations  # 延迟求值类型注解
from __future__ import division     # 真除法
from __future__ import print_function
```

## 代码风格

### 命名规范

| 类型 | 规范 | 示例 |
|------|------|------|
| 模块 | `lower_with_under.py` | `my_module.py` |
| 类 | `CapWords` | `MyClass` |
| 函数/方法 | `lower_with_under()` | `my_function()` |
| 常量 | `CAPS_WITH_UNDER` | `MAX_SIZE` |
| 私有 | `_leading_underscore` | `_internal()` |

### 文档字符串

```python
def fetch_data(url: str, timeout: int = 30) -> dict:
    """从指定 URL 获取数据。

    Args:
        url: 请求地址。
        timeout: 超时时间（秒），默认 30。

    Returns:
        解析后的 JSON 数据字典。

    Raises:
        requests.RequestException: 网络请求失败。
    """
```

### 类型注解

```python
from typing import Optional, List

def get_user(user_id: int) -> Optional[dict]:
    users: List[dict] = load_users()
    return next((u for u in users if u["id"] == user_id), None)
```
