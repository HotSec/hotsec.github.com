# Pydantic

Python 数据校验与序列化框架，基于 Python 类型注解，是 FastAPI 的核心依赖。

## 核心概念

### BaseModel

```python
from pydantic import BaseModel, Field

class User(BaseModel):
    id: int
    name: str
    email: str
    age: int | None = None
    is_active: bool = True

user = User(id=1, name="Alice", email="alice@example.com")
print(user.model_dump())
print(user.model_dump_json())
```

### Field 字段配置

```python
from pydantic import BaseModel, Field

class Item(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="物品名称")
    price: float = Field(..., gt=0, description="价格")
    quantity: int = Field(default=0, ge=0)
    tags: list[str] = Field(default_factory=list)
```

## 数据校验

### 内置校验器

```python
from pydantic import BaseModel, Field, EmailStr, HttpUrl, field_validator

class UserProfile(BaseModel):
    email: EmailStr
    website: HttpUrl | None = None
    score: int = Field(ge=0, le=100)

    @field_validator("score")
    @classmethod
    def validate_score(cls, v):
        if v % 5 != 0:
            raise ValueError("score must be a multiple of 5")
        return v
```

### model_validator 模型级校验

```python
from pydantic import BaseModel, model_validator

class DateRange(BaseModel):
    start: date
    end: date

    @model_validator(mode="after")
    def check_dates(self):
        if self.start >= self.end:
            raise ValueError("start must be before end")
        return self
```

### 自定义校验器

```python
from pydantic import BaseModel, field_validator

class Password(BaseModel):
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError("密码至少8位")
        if not any(c.isupper() for c in v):
            raise ValueError("密码需包含大写字母")
        if not any(c.isdigit() for c in v):
            raise ValueError("密码需包含数字")
        return v
```

## 序列化

### model_dump / model_dump_json

```python
user = User(id=1, name="Alice", email="alice@example.com", age=25)

user.model_dump()
user.model_dump(exclude={"age"})
user.model_dump(exclude_unset=True)
user.model_dump_json(indent=2)
```

### model_validate / model_validate_json

```python
User.model_validate({"id": 1, "name": "Alice", "email": "a@b.com"})
User.model_validate_json('{"id":1,"name":"Alice","email":"a@b.com"}')
```

## 嵌套模型

```python
class Address(BaseModel):
    city: str
    street: str

class Company(BaseModel):
    name: str
    address: Address

class Employee(BaseModel):
    name: str
    company: Company

emp = Employee.model_validate({
    "name": "Bob",
    "company": {
        "name": "Acme",
        "address": {"city": "Beijing", "street": "Chaoyang Rd"}
    }
})
```

## 配置

### model_config

```python
from pydantic import BaseModel, ConfigDict

class Model(BaseModel):
    model_config = ConfigDict(
        str_strip_whitespace=True,
        str_min_length=1,
        json_schema_extra={"examples": [{"name": "test"}]},
        from_attributes=True,
        populate_by_name=True,
    )
    name: str
```

### from_attributes（ORM 模式）

```python
from pydantic import BaseModel, ConfigDict

class UserORM:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

class UserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    name: str

orm_obj = UserORM(id=1, name="Alice")
user = UserSchema.model_validate(orm_obj)
```

## Pydantic V2 特性

### 性能提升

- 核心校验逻辑用 Rust 重写，性能提升 5-50 倍
- `model_validate` 替代 `parse_obj`
- `model_dump` 替代 `dict()`
- `model_dump_json` 替代 `json()`

### TypeAdapter

```python
from pydantic import TypeAdapter

adapter = TypeAdapter(list[int])
result = adapter.validate_python([1, 2, 3])
json_str = adapter.dump_json([1, 2, 3])
```

### computed_field

```python
from pydantic import BaseModel, computed_field

class Rectangle(BaseModel):
    width: float
    height: float

    @computed_field
    @property
    def area(self) -> float:
        return self.width * self.height
```

## 常用模式

### 别名与序列化名

```python
from pydantic import BaseModel, Field

class APIResponse(BaseModel):
    user_name: str = Field(alias="userName")
    created_at: datetime = Field(alias="createdAt")

    model_config = ConfigDict(populate_by_name=True)
```

### 泛型模型

```python
from typing import TypeVar, Generic
from pydantic import BaseModel

T = TypeVar("T")

class Response(BaseModel, Generic[T]):
    code: int = 0
    message: str = "ok"
    data: T | None = None

Response[User](data=user)
Response[list[User]](data=[user1, user2])
```

### Discriminated Union

```python
from typing import Literal, Annotated, Union
from pydantic import BaseModel, Field, Tag

class Cat(BaseModel):
    pet_type: Literal["cat"]
    meow: str

class Dog(BaseModel):
    pet_type: Literal["dog"]
    bark: str

Pet = Annotated[Union[Cat, Dog], Field(discriminator="pet_type")]
```
