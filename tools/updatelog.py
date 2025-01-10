# 读取git记录生成变得记录changelog

import subprocess
import re
import os

# 获取当前目录
current_dir = os.getcwd()

# 获取提交时间
date = subprocess.check_output(['git', 'log', '-1', '--pretty=format:%cs']).decode('utf-8')
# 获取提交说明
commit = subprocess.check_output(['git', 'log', '-1', '--pretty=format:%s']).decode('utf-8')

# 获取git记录中所有变动过的文件
files = subprocess.check_output(['git', '-c', 'core.quotepath=false', 'show','-1', '--pretty=','--name-only',]).decode('utf-8').split('\n')
print(files)
# 生成changelog
changelog = f'## {date} {commit}\n\n'
for file in files:
    if ".md" in file and "notebook" in file:
        print(file)
        wfile = re.sub(r'src/notebook/', '', file)
        changelog += f'- {wfile}\n'

# 写入文件
with open('src/notebook/README.md', 'a+') as f:
    f.write(changelog)
print('changelog.md已生成')
