# SQLAlchemy

Python SQL 工具包与 ORM 框架，提供 Core（SQL 表达式）和 ORM（对象关系映射）两层。

## 架构

- **Core**：SQL 表达式语言，直接操作 SQL，灵活高效
- **ORM**：对象关系映射，以 Python 类操作数据库
- **两者可混合使用**：ORM 底层基于 Core

## 连接与引擎

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase

engine = create_engine("sqlite:///example.db", echo=True)
engine = create_engine("postgresql://user:pass@localhost/db", pool_size=10, max_overflow=20)
engine = create_engine("mysql+pymysql://user:pass@localhost/db")

Session = sessionmaker(bind=engine)
session = Session()
```

## 声明式映射

```python
from sqlalchemy import String, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship

class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    email: Mapped[str] = mapped_column(String(100), unique=True)
    age: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    posts: Mapped[list["Post"]] = relationship(back_populates="author")

class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    author: Mapped["User"] = relationship(back_populates="posts")
```

## 建表

```python
Base.metadata.create_all(engine)
Base.metadata.drop_all(engine)
```

## CRUD

### Create

```python
user = User(name="Alice", email="alice@example.com", age=25)
session.add(user)
session.add_all([User(name="Bob"), User(name="Charlie")])
session.commit()
```

### Read

```python
user = session.get(User, 1)
user = session.execute(select(User).where(User.name == "Alice")).scalar_one_or_none()
users = session.execute(select(User).where(User.age > 20)).scalars().all()
```

### Update

```python
user = session.get(User, 1)
user.age = 26
session.commit()

session.execute(update(User).where(User.name == "Alice").values(age=26))
session.commit()
```

### Delete

```python
session.delete(user)
session.commit()

session.execute(delete(User).where(User.age < 18))
session.commit()
```

## 查询

### Select 基础

```python
from sqlalchemy import select

stmt = select(User).where(User.age > 20).order_by(User.name).limit(10)
result = session.execute(stmt)
users = result.scalars().all()
```

### 条件过滤

```python
from sqlalchemy import and_, or_, not_

select(User).where(User.age > 20, User.name.like("A%"))
select(User).where(or_(User.age < 18, User.age > 60))
select(User).where(User.name.in_(["Alice", "Bob"]))
select(User).where(User.email.contains("example"))
```

### 聚合与分组

```python
from sqlalchemy import func, count

session.execute(select(func.count(User.id))).scalar()
session.execute(select(User.age, func.count(User.id)).group_by(User.age)).all()
```

### Join

```python
stmt = select(User, Post).join(Post, User.id == Post.author_id)
stmt = select(User).join(User.posts).where(Post.title.like("%Python%"))
```

### 子查询

```python
from sqlalchemy import subquery

sq = select(func.count(Post.id).label("cnt"), Post.author_id).group_by(Post.author_id).subquery()
stmt = select(User.name, sq.c.cnt).join(sq, User.id == sq.c.author_id)
```

## 关系映射

### 一对多

```python
class Department(Base):
    __tablename__ = "departments"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    employees: Mapped[list["Employee"]] = relationship(back_populates="department")

class Employee(Base):
    __tablename__ = "employees"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    dept_id: Mapped[int] = mapped_column(ForeignKey("departments.id"))
    department: Mapped["Department"] = relationship(back_populates="employees")
```

### 多对多

```python
from sqlalchemy import Table

student_course = Table(
    "student_course", Base.metadata,
    Column("student_id", ForeignKey("students.id"), primary_key=True),
    Column("course_id", ForeignKey("courses.id"), primary_key=True),
)

class Student(Base):
    __tablename__ = "students"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(50))
    courses: Mapped[list["Course"]] = relationship(secondary=student_course, back_populates="students")

class Course(Base):
    __tablename__ = "courses"
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    students: Mapped[list["Student"]] = relationship(secondary=student_course, back_populates="courses")
```

## N+1 优化

```python
from sqlalchemy.orm import selectinload, joinedload, subqueryload

stmt = select(User).options(selectinload(User.posts))
stmt = select(User).options(joinedload(User.posts))
```

## 事务

```python
from sqlalchemy import begin

with session.begin():
    session.add(User(name="Alice"))
    session.add(Post(title="Hello"))

with engine.begin() as conn:
    conn.execute(update(User).values(age=30))
```

## 异步支持

```python
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

engine = create_async_engine("postgresql+asyncpg://user:pass@localhost/db")
async_session = async_sessionmaker(engine, class_=AsyncSession)

async def get_user():
    async with async_session() as session:
        result = await session.execute(select(User).where(User.id == 1))
        return result.scalar_one_or_none()
```

## Alembic 迁移

```bash
alembic init migrations
alembic revision --autogenerate -m "create users table"
alembic upgrade head
alembic downgrade -1
alembic history
```

## 常见问题

- **N+1 查询**：使用 `selectinload` / `joinedload` 预加载关联
- **Session 泄漏**：确保 `session.close()` 或使用上下文管理器
- **并发写入**：使用 `with_for_update()` 行级锁
- **大数据量**：使用 `yield_per()` 分批获取
