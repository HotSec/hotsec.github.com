# Flask 进阶

## 异步任务 (Celery)

### 基础配置

```python
from celery import Celery
from flask import Flask

def make_celery(app: Flask) -> Celery:
    celery = Celery(
        app.import_name,
        broker=app.config["CELERY_BROKER_URL"],
        backend=app.config["CELERY_RESULT_BACKEND"],
    )
    celery.conf.update(app.config)

    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

app = Flask(__name__)
app.config["CELERY_BROKER_URL"] = "redis://localhost:6379/0"
app.config["CELERY_RESULT_BACKEND"] = "redis://localhost:6379/1"

celery = make_celery(app)
```

### 任务定义

```python
@celery.task(bind=True, max_retries=3, default_retry_delay=60)
def send_email(self, to: str, subject: str, body: str):
    try:
        msg = Message(subject, recipients=[to], body=body)
        mail.send(msg)
    except SMTPException as exc:
        raise self.retry(exc=exc)

@celery.task
def generate_report(report_id: int):
    report = Report.query.get(report_id)
    data = collect_data(report.params)
    pdf = render_pdf(data)
    report.file_url = upload_to_s3(pdf)
    report.status = "completed"
    db.session.commit()

@celery.task(ignore_result=True)
def cleanup_expired_sessions():
    cutoff = datetime.utcnow() - timedelta(days=30)
    Session.query.filter(Session.last_active < cutoff).delete()
    db.session.commit()
```

### 定时任务

```python
from celery.schedules import crontab

celery.conf.beat_schedule = {
    "cleanup-every-night": {
        "task": "tasks.cleanup_expired_sessions",
        "schedule": crontab(hour=3, minute=0),
    },
    "health-check-every-5min": {
        "task": "tasks.check_services",
        "schedule": 300,
    },
    "weekly-report": {
        "task": "tasks.generate_weekly_report",
        "schedule": crontab(hour=9, minute=0, day_of_week=1),
    },
}
```

### 任务链与组

```python
from celery import chain, group, chord

workflow = chain(
    fetch_data.s(url),
    process_data.s(),
    save_result.s()
)
workflow.apply_async()

batch = group(process_item.s(item_id) for item_id in item_ids)
result = batch.apply_async()

pipeline = chord(
    group(process_chunk.s(chunk) for chunk in chunks),
    merge_results.s()
)
pipeline.apply_async()
```

***

## WebSocket (Flask-SocketIO)

### 基础配置

```python
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = "secret"
socketio = SocketIO(app, cors_allowed_origins="*", message_queue="redis://")
```

### 命名空间与事件

```python
@socketio.on("connect", namespace="/chat")
def handle_connect():
    join_room(request.args.get("room"))
    emit("user_joined", {"user": current_user.name}, room=request.args.get("room"))

@socketio.on("disconnect", namespace="/chat")
def handle_disconnect():
    room = session.get("room")
    leave_room(room)
    emit("user_left", {"user": current_user.name}, room=room)

@socketio.on("message", namespace="/chat")
def handle_message(data):
    room = session.get("room")
    msg = Message(
        room=room,
        user=current_user.name,
        content=data["content"],
    )
    db.session.add(msg)
    db.session.commit()
    emit("message", {
        "user": current_user.name,
        "content": data["content"],
        "time": msg.created_at.isoformat(),
    }, room=room)
```

### 实时通知

```python
@socketio.on("subscribe", namespace="/notifications")
def handle_subscribe():
    for channel in current_user.subscribed_channels:
        join_room(f"channel:{channel.id}")

def push_notification(user_id: int, notification: dict):
    socketio.emit(
        "notification",
        notification,
        room=f"user:{user_id}",
        namespace="/notifications",
    )
```

### 后台任务推送

```python
@celery.task
def long_running_analysis(dataset_id: int):
    dataset = Dataset.query.get(dataset_id)
    for i, chunk in enumerate(dataset.chunks()):
        result = analyze(chunk)
        socketio.emit(
            "progress",
            {"current": i + 1, "total": dataset.chunk_count, "result": result},
            room=f"analysis:{dataset_id}",
            namespace="/analysis",
        )
    socketio.emit(
        "complete",
        {"dataset_id": dataset_id},
        room=f"analysis:{dataset_id}",
        namespace="/analysis",
    )
```

***

## 应用工厂模式

### 工厂函数

```python
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

def create_app(config_name="default"):
    app = Flask(__name__)
    app.config.from_object(get_config(config_name))

    db.init_app(app)
    migrate.init_app(app, db)

    from .api import api_bp
    from .auth import auth_bp
    from .admin import admin_bp

    app.register_blueprint(api_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    return app
```

### 蓝图组织

```python
from flask import Blueprint

api_bp = Blueprint("api", __name__, url_prefix="/api/v1")

@api_bp.route("/articles", methods=["GET"])
def list_articles():
    articles = Article.query.paginate()
    return jsonify({"articles": [a.to_dict() for a in articles.items]})

@api_bp.route("/articles/<int:id>", methods=["GET"])
def get_article(id):
    article = Article.query.get_or_404(id)
    return jsonify(article.to_dict())
```

### 配置管理

```python
class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev")
    SQLALCHEMY_TRACK_MODIFICATIONS = False

class DevelopmentConfig(Config):
    DEBUG = True
    SQLALCHEMY_DATABASE_URI = "postgresql://localhost/myapp_dev"

class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "postgresql://localhost/myapp_test"
    WTF_CSRF_ENABLED = False

class ProductionConfig(Config):
    SQLALCHEMY_DATABASE_URI = os.environ["DATABASE_URL"]
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_size": 10,
        "pool_recycle": 3600,
        "pool_pre_ping": True,
    }

config_map = {
    "development": DevelopmentConfig,
    "testing": TestingConfig,
    "production": ProductionConfig,
}

def get_config(name):
    return config_map.get(name, DevelopmentConfig)
```

***

## Flask 与数据库进阶

### 多数据库支持

```python
SQLALCHEMY_BINDS = {
    "default": "postgresql://localhost/main",
    "analytics": "postgresql://localhost/analytics",
    "cache": "sqlite:///cache.db",
}

class User(db.Model):
    __bind_key__ = "default"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class Event(db.Model):
    __bind_key__ = "analytics"
    id = db.Column(db.Integer, primary_key=True)
    event_type = db.Column(db.String(50))
    payload = db.Column(db.JSON)
```

### 读写分离

```python
from sqlalchemy import orm

class ReadWriteSession:
    def __init__(self, app):
        self.app = app
        self.engines = {
            "writer": create_engine(app.config["DATABASE_URL"]),
            "reader": create_engine(app.config["DATABASE_READER_URL"]),
        }

    def get_session(self, use_reader=False):
        bind = "reader" if use_reader else "writer"
        return orm.sessionmaker(bind=self.engines[bind])()

@app.before_request
def set_db_role():
    if request.method == "GET" and not request.path.startswith("/admin"):
        g.use_reader = True
```

### 数据库迁移最佳实践

```bash
flask db init
flask db migrate -m "add user table"
flask db upgrade
flask db downgrade
flask db history
flask db current
```

```python
def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

def downgrade():
    op.drop_index("ix_users_email")
    op.drop_table("users")
```

***

## 部署

### Gunicorn + Uvicorn

```bash
gunicorn "app:create_app()" \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile - \
    --error-logfile -
```

### Docker 部署

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN useradd -m appuser
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["gunicorn", "app:create_app()", "--bind", "0.0.0.0:8000", "--workers", "4"]
```

```yaml
services:
  web:
    build: .
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=postgresql://db:5432/myapp
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  worker:
    build: .
    command: celery -A app.celery worker --loglevel=info --concurrency=4
    environment:
      - DATABASE_URL=postgresql://db:5432/myapp
      - CELERY_BROKER_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis

  beat:
    build: .
    command: celery -A app.celery beat --loglevel=info
    depends_on:
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  pg_data:
  redis_data:
```

### Nginx 反向代理

```nginx
upstream flask_app {
    server web:8000;
}

server {
    listen 80;
    server_name example.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;

    location / {
        proxy_pass http://flask_app;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://flask_app;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /static/ {
        alias /app/static/;
        expires 30d;
    }
}
```
