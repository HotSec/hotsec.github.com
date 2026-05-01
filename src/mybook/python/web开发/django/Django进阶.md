# Django 进阶

## 信号 (Signals)

### 内置信号

```python
from django.db.models.signals import pre_save, post_save, pre_delete, post_delete
from django.dispatch import receiver
from django.contrib.auth.signals import user_logged_in, user_logged_out
from django.core.signals import request_started, request_finished

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_delete, sender=Order)
def cleanup_order_files(sender, instance, **kwargs):
    instance.invoice.delete(save=False)
    instance.attachment.delete(save=False)

@receiver(user_logged_in)
def log_login(sender, request, user, **kwargs):
    LoginLog.objects.create(
        user=user,
        ip=get_client_ip(request),
        user_agent=request.META.get("HTTP_USER_AGENT", ""),
    )
```

### 自定义信号

```python
import django.dispatch

order_paid = django.dispatch.Signal()
order_shipped = django.dispatch.Signal()

class OrderService:
    def pay(self, order):
        order.status = "paid"
        order.paid_at = timezone.now()
        order.save()
        order_paid.send(
            sender=self.__class__,
            order=order,
            amount=order.total,
        )

@receiver(order_paid)
def send_payment_notification(sender, order, amount, **kwargs):
    send_mail(
        subject=f"Order {order.id} Paid",
        message=f"Payment of {amount} received.",
        from_email="noreply@example.com",
        recipient_list=[order.user.email],
    )

@receiver(order_paid)
def update_inventory(sender, order, **kwargs):
    for item in order.items.all():
        item.product.stock -= item.quantity
        item.product.save()
```

### 信号最佳实践

- 信号处理器保持轻量，耗时操作用 Celery
- 避免在信号中触发其他信号（防止循环）
- 使用 `@receiver` 装饰器而非 `connect()`
- 在 `apps.py` 的 `ready()` 中注册信号

```python
from django.apps import AppConfig

class OrdersConfig(AppConfig):
    name = "orders"

    def ready(self):
        import orders.signals
```

***

## 中间件 (Middleware)

### 自定义中间件

```python
import time
import logging

logger = logging.getLogger(__name__)

class RequestTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.monotonic()
        response = self.get_response(request)
        elapsed = time.monotonic() - start
        response["X-Response-Time"] = f"{elapsed:.3f}s"
        logger.info(
            "%s %s -> %d (%.3fs)",
            request.method,
            request.path,
            response.status_code,
            elapsed,
        )
        return response


class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            response = HttpResponse()
        else:
            response = self.get_response(request)

        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "GET,POST,PUT,DELETE,OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type,Authorization"
        response["Access-Control-Max-Age"] = "86400"
        return response


class TenantMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        host = request.get_host().split(":")[0]
        try:
            request.tenant = Tenant.objects.get(domain=host)
        except Tenant.DoesNotExist:
            return HttpResponse("Tenant not found", status=404)
        return self.get_response(request)
```

### 中间件执行顺序

```
请求 → M1.process_request → M2.process_request → View →
M2.process_response → M1.process_response → 响应
```

- Django 按顺序执行请求阶段
- 按逆序执行响应阶段
- 异常处理按逆序执行

***

## 缓存 (Caching)

### 缓存配置

```python
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.redis.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        },
        "KEY_PREFIX": "myapp",
        "TIMEOUT": 300,
    },
    "local": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    },
}
```

### 视图缓存

```python
from django.views.decorators.cache import cache_page, cache_control
from django.views.decorators.vary import vary_on_headers, vary_on_cookie

@cache_page(60 * 15)
@vary_on_headers("X-API-Version")
def article_list(request):
    articles = Article.objects.all()
    return render(request, "articles/list.html", {"articles": articles})

@cache_page(60 * 5)
@cache_control(private=True)
@vary_on_cookie
def user_dashboard(request):
    return render(request, "dashboard.html")
```

### 模板片段缓存

```html
{% load cache %}
{% cache 500 sidebar request.user.username %}
    <nav>
        {% for item in user_menu %}
            <a href="{{ item.url }}">{{ item.label }}</a>
        {% endfor %}
    </nav>
{% endcache %}
```

### 底层缓存 API

```python
from django.core.cache import cache

cache.set("user:1001", {"name": "Alice", "role": "admin"}, timeout=3600)
user = cache.get("user:1001")

cache.set_many({"k1": "v1", "k2": "v2"}, timeout=60)
result = cache.get_many(["k1", "k2"])

cache.delete("user:1001")
cache.delete_many(["k1", "k2"])

was_set = cache.add("lock:order:1001", "1", timeout=30)
if not was_set:
    raise ConflictError("Order is being processed")

cache.touch("session:abc", timeout=3600)
```

### 缓存策略

| 场景 | 策略 | 说明 |
|------|------|------|
| 首页/列表页 | `cache_page` | 整页缓存 |
| 用户相关页面 | `vary_on_cookie` | 按用户缓存 |
| API 响应 | 手动缓存 + TTL | 灵活控制 |
| 计数器/排行榜 | `cache.incr` | 原子操作 |
| 防重复提交 | `cache.add` | 原子锁 |

***

## Django REST Framework 进阶

### 自定义权限

```python
from rest_framework.permissions import BasePermission

class IsOwnerOrAdmin(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.user.is_staff:
            return True
        return obj.owner == request.user

class HasAPIKey(BasePermission):
    def has_permission(self, request, view):
        api_key = request.META.get("HTTP_X_API_KEY", "")
        return APIKey.objects.filter(key=api_key, is_active=True).exists()
```

### 自定义分页

```python
from rest_framework.pagination import CursorPagination

class ArticleCursorPagination(CursorPagination):
    ordering = "-created_at"
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100
```

### 嵌套序列化器

```python
class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ["id", "content", "author", "created_at"]

class ArticleDetailSerializer(serializers.ModelSerializer):
    comments = CommentSerializer(many=True, read_only=True)
    tags = serializers.SlugRelatedField(
        many=True, slug_field="name", queryset=Tag.objects.all()
    )

    class Meta:
        model = Article
        fields = ["id", "title", "content", "tags", "comments", "created_at"]
```

### ViewSet 动作

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class ArticleViewSet(viewsets.ModelViewSet):
    queryset = Article.objects.all()
    serializer_class = ArticleSerializer

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        article = self.get_object()
        article.status = "published"
        article.published_at = timezone.now()
        article.save()
        return Response({"status": "published"})

    @action(detail=False, methods=["get"])
    def drafts(self, request):
        drafts = self.get_queryset().filter(status="draft", author=request.user)
        serializer = self.get_serializer(drafts, many=True)
        return Response(serializer.data)
```

***

## 异步视图

```python
async def async_article_list(request):
    articles = await sync_to_async(list)(Article.objects.all()[:20])
    return JsonResponse({"articles": [a.title for a in articles]})

class AsyncArticleDetailView(View):
    async def get(self, request, pk):
        article = await sync_to_async(Article.objects.get)(pk=pk)
        return JsonResponse({"title": article.title})
```

### 异步中间件

```python
class AsyncTimingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    async def __call__(self, request):
        start = time.monotonic()
        response = await self.get_response(request)
        elapsed = time.monotonic() - start
        response["X-Response-Time"] = f"{elapsed:.3f}s"
        return response
```

***

## 部署

### 生产配置清单

```python
SECRET_KEY = os.environ["DJANGO_SECRET_KEY"]
DEBUG = False
ALLOWED_HOSTS = ["example.com", "www.example.com"]

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ["DB_NAME"],
        "USER": os.environ["DB_USER"],
        "PASSWORD": os.environ["DB_PASSWORD"],
        "HOST": os.environ.get("DB_HOST", "localhost"),
        "PORT": os.environ.get("DB_PORT", "5432"),
        "CONN_MAX_AGE": 60,
        "OPTIONS": {"sslmode": "require"},
    }
}

SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
```

### Gunicorn 配置

```python
bind = "0.0.0.0:8000"
workers = 4
worker_class = "uvicorn.workers.UvicornWorker"
threads = 2
timeout = 120
keepalive = 5
max_requests = 5000
max_requests_jitter = 500
accesslog = "-"
errorlog = "-"
loglevel = "info"
```

### Docker 部署

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000"]
```

```yaml
services:
  web:
    build: .
    command: gunicorn config.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - static_data:/app/staticfiles
    environment:
      - DJANGO_SETTINGS_MODULE=config.production
    depends_on:
      - db
      - redis

  db:
    image: postgres:16
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - static_data:/app/staticfiles
    depends_on:
      - web

volumes:
  pg_data:
  static_data:
```

### 健康检查

```python
from django.http import JsonResponse
from django.db import connection
from django.core.cache import cache

def health_check(request):
    checks = {}

    try:
        connection.ensure_connection()
        checks["database"] = "ok"
    except Exception as e:
        checks["database"] = f"error: {e}"

    try:
        cache.set("_health", "1", 1)
        checks["cache"] = "ok" if cache.get("_health") == "1" else "error"
    except Exception as e:
        checks["cache"] = f"error: {e}"

    status = 200 if all(v == "ok" for v in checks.values()) else 503
    return JsonResponse(checks, status=status)
```
