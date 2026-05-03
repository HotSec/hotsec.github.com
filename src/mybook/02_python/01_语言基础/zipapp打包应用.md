# python 应用程序打包

构建myapp目录如下:

├── myapp
│   ├── example.py
│   └── hello.py

代码分别如下:

```py
# example.py
import hello

def main():
   print('Hello World')
   hello.say_hello("python")
   
if __name__=='__main__':
   main()
```

```py
# hello.py

def say_hello(name):
    print("hello",name)
```

将整个myapp打包成应用程序，命令执行后会生成一个名叫 myapp.pyz 应用程序。

`python -m zipapp myapp -m "example:main"`
使用python直接运行应用程序

```bash
# python myapp.pyz
Hello World
hello python
```
使用zipapp打包应用程序，可以方便的将应用程序打包成可执行文件，方便分发和部署。
