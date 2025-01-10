# flask

## 安装

`pip install flask`

## 最小化

```python
from flask import Flask
app = Flask(__name__)
 
@app.route("/")
def hello():
    return "Hello World!"
 
if __name__ == "__main__":
    app.run()
```
