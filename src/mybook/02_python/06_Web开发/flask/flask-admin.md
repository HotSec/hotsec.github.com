# Flask-Admin

Flask-Admin 是 Flask 的后台管理界面扩展，自动为模型生成 CRUD 管理页面。

## 安装

```bash
pip install flask-admin
```

## 基本使用

```python
from flask import Flask
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView

app = Flask(__name__)
admin = Admin(app, name="管理后台", template_mode="bootstrap4")

class UserAdmin(ModelView):
    column_list = ("id", "username", "email", "created_at")
    column_searchable_list = ("username", "email")
    column_filters = ("created_at",)
    form_columns = ("username", "email")

admin.add_view(UserAdmin(User, db.session))
```

## 自定义视图

```python
from flask_admin import BaseView, expose

class AnalyticsView(BaseView):
    @expose("/")
    def index(self):
        return self.render("analytics.html", data=get_stats())

admin.add_view(AnalyticsView(name="数据分析", endpoint="analytics"))
```

## 文件管理

```python
from flask_admin.contrib.fileadmin import FileAdmin

admin.add_view(FileAdmin("/path/to/uploads", "/uploads/", name="文件管理"))
```

## 权限控制

```python
class AdminModelView(ModelView):
    def is_accessible(self):
        return current_user.is_authenticated and current_user.is_admin

    def inaccessible_callback(self, name, **kwargs):
        return redirect(url_for("login"))
```

## 常用配置

| 选项 | 说明 |
|------|------|
| `column_list` | 列表页显示字段 |
| `column_searchable_list` | 可搜索字段 |
| `column_filters` | 过滤器字段 |
| `form_columns` | 表单编辑字段 |
| `page_size` | 每页条数 |
| `can_export` | 是否允许导出 CSV |
