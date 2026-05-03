# fabric

```python
from fabric2 import Connection
 
 
def deploy():
    # 如果服务器配置了ssh免密码登录，就不需要 connect_kwargs 来指定密码
    conn = Connection("root@192.168.44.13", connect_kwargs={"password": "123456"})
    conn.run("ls")
 
    with conn.cd('/home'):
        conn.run("mkdir testdir")
    with conn.cd('/home/testdir'):
        conn.run('mkdir aaa')
        conn.put('test', '/home/testdir')  # 上传文件
 
 
if __name__ == '__main__':
    deploy()
```
