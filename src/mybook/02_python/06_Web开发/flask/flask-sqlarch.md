# Flask-SQLAlchemy

Flask-SQLAlchemy 是 Flask 的 SQLAlchemy 扩展，简化了数据库操作。

## 安装

```bash
pip install flask-sqlalchemy
```

## 基本配置

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db = SQLAlchemy(app)
```

## 定义模型

```python
class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())

    posts = db.relationship("Post", backref="author", lazy="dynamic")

class Post(db.Model):
    __tablename__ = "posts"

    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    body = db.Column(db.Text)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
```

## CRUD 操作

```python
user = User(username="alice", email="alice@example.com")
db.session.add(user)
db.session.commit()

users = User.query.filter_by(username="alice").all()
user = User.query.get(1)

user.email = "new@example.com"
db.session.commit()

db.session.delete(user)
db.session.commit()
```

## 关系查询

```python
user = User.query.get(1)
posts = user.posts.all()

post = Post.query.join(User).filter(User.username == "alice").first()
```

## 分页

```python
page = Post.query.paginate(page=1, per_page=10, error_out=False)
posts = page.items
total = page.total
has_next = page.has_next
```

## 常用配置

| 配置项 | 说明 |
|--------|------|
| `SQLALCHEMY_DATABASE_URI` | 数据库连接串 |
| `SQLALCHEMY_ECHO` | 打印 SQL 日志 |
| `SQLALCHEMY_POOL_SIZE` | 连接池大小 |
| `SQLALCHEMY_POOL_RECYCLE` | 连接回收时间（秒） |
