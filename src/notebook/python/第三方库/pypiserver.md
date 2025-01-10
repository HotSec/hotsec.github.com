# pypiserver

`pypi-server run -p 8080 -P H:/.pypipasswd H:/packages`

```bash
twine upload dist/* --repository-url http://192.168.1.1:8080 -u 账号 -p 密码
Uploading distributions to http://192.168.31.31:8080
Uploading hotfinger-0.1.0-py3-none-any.whl
100% ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.6/1.6 MB • 00:00 • 121.2 MB/s
Uploading hotfinger-0.1.1-py3-none-any.whl
100% ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 685.9/685.9 kB • 00:00 • 153.2 MB/s
Uploading hotfinger-0.1.2.1-py3-none-any.whl
...
```

> `https://blog.csdn.net/lly1122334/article/details/123049183`
