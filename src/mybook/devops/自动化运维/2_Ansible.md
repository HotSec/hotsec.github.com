# Ansible 自动化运维

## 1. Ansible 概述

Ansible 是无 Agent 的自动化运维工具，通过 SSH 推送配置，使用 YAML 声明式语法。

### 1.1 核心特性

| 特性 | 说明 |
|------|------|
| 无 Agent | 仅需 SSH，无需在目标安装客户端 |
| 幂等性 | 多次执行结果一致 |
| 声明式 | 描述期望状态 |
| 模块化 | 丰富的内置模块 |
| 推送模式 | 主动推送到目标主机 |

## 2. 安装与配置

### 2.1 安装

```bash
pip install ansible
# 或
apt install ansible
yum install ansible
```

### 2.2 ansible.cfg

```ini
# /etc/ansible/ansible.cfg 或项目目录
[defaults]
inventory = hosts
remote_user = admin
private_key_file = ~/.ssh/id_ed25519
host_key_checking = False
timeout = 30
forks = 50
roles_path = ./roles
log_path = /var/log/ansible.log

[privilege_escalation]
become = True
become_method = sudo
become_user = root
become_ask_pass = False
```

### 2.3 Inventory（清单）

```ini
# 静态清单 hosts
[webservers]
web1 ansible_host=192.168.1.10
web2 ansible_host=192.168.1.11

[dbservers]
db1 ansible_host=192.168.1.20

[production:children]
webservers
dbservers

[webservers:vars]
nginx_port=80

[all:vars]
ansible_user=admin
ansible_ssh_private_key_file=~/.ssh/id_ed25519
```

```yaml
# 动态清单（YAML格式）
all:
  children:
    webservers:
      hosts:
        web1:
          ansible_host: 192.168.1.10
        web2:
          ansible_host: 192.168.1.11
    dbservers:
      hosts:
        db1:
          ansible_host: 192.168.1.20
```

## 3. 常用模块

```bash
ansible all -m ping                                    # 连通性测试
ansible webservers -m shell -a "uptime"                # 执行命令
ansible webservers -m command -a "df -h"                # 执行命令（无shell特性）
ansible webservers -m copy -a "src=app.conf dest=/etc/app.conf"
ansible webservers -m template -a "src=app.j2 dest=/etc/app.conf"
ansible webservers -m file -a "path=/data/app state=directory mode=0755"
ansible webservers -m yum -a "name=nginx state=latest"
ansible webservers -m apt -a "name=nginx state=present update_cache=yes"
ansible webservers -m service -a "name=nginx state=started enabled=yes"
ansible webservers -m systemd -a "name=nginx state=restarted"
ansible webservers -m user -a "name=deploy shell=/bin/bash groups=docker"
ansible webservers -m git -a "repo=https://github.com/app.git dest=/opt/app version=main"
ansible webservers -m get_url -a "url=https://example.com/file.tar.gz dest=/tmp/"
ansible webservers -m unarchive -a "src=/tmp/file.tar.gz dest=/opt/ remote_src=yes"
ansible webservers -m docker_container -a "name=web image=nginx ports=80:80"
ansible webservers -m setup                            # 收集 Facts
```

## 4. Playbook

### 4.1 基本 Playbook

```yaml
- name: Deploy Web Application
  hosts: webservers
  become: true

  vars:
    app_name: myapp
    app_port: 8080

  tasks:
  - name: Install dependencies
    apt:
      name:
      - nginx
      - python3-pip
      state: present
      update_cache: true

  - name: Create app directory
    file:
      path: /opt/{{ app_name }}
      state: directory
      owner: www-data
      mode: "0755"

  - name: Deploy application
    git:
      repo: "https://github.com/example/{{ app_name }}.git"
      dest: "/opt/{{ app_name }}"
      version: main

  - name: Install Python dependencies
    pip:
      requirements: "/opt/{{ app_name }}/requirements.txt"
      virtualenv: "/opt/{{ app_name }}/venv"

  - name: Configure nginx
    template:
      src: nginx.conf.j2
      dest: /etc/nginx/sites-available/{{ app_name }}
    notify: Reload nginx

  - name: Enable site
    file:
      src: /etc/nginx/sites-available/{{ app_name }}
      dest: /etc/nginx/sites-enabled/{{ app_name }}
      state: link
    notify: Reload nginx

  - name: Start application
    systemd:
      name: "{{ app_name }}"
      state: started
      enabled: true
      daemon_reload: true

  handlers:
  - name: Reload nginx
    service:
      name: nginx
      state: reloaded
```

### 4.2 条件与循环

```yaml
tasks:
- name: Install on Debian
  apt:
    name: nginx
    state: present
  when: ansible_os_family == "Debian"

- name: Install on RedHat
  yum:
    name: nginx
    state: present
  when: ansible_os_family == "RedHat"

- name: Install packages
  apt:
    name: "{{ item }}"
    state: present
  loop:
  - nginx
  - redis-server
  - postgresql

- name: Create users
  user:
    name: "{{ item.name }}"
    groups: "{{ item.groups }}"
    shell: "{{ item.shell | default('/bin/bash') }}"
  loop:
  - { name: alice, groups: sudo }
  - { name: bob, groups: docker }
  - { name: charlie, groups: 'sudo,docker' }
```

### 4.3 错误处理

```yaml
tasks:
- block:
  - name: Attempt database migration
    command: python manage.py migrate
    register: migrate_result

  - name: Report success
    debug:
      msg: "Migration successful"

  rescue:
  - name: Rollback migration
    command: python manage.py migrate {{ migrate_result.rollback_version }}

  - name: Notify team
    mail:
      to: team@example.com
      subject: "Migration failed on {{ inventory_hostname }}"

  always:
  - name: Cleanup temp files
    file:
      path: /tmp/migration
      state: absent
```

### 4.4 Tags

```yaml
tasks:
- name: Install packages
  apt:
    name: nginx
  tags: [install, packages]

- name: Configure
  template:
    src: nginx.conf.j2
    dest: /etc/nginx/nginx.conf
  tags: [config]

# 执行
# ansible-playbook site.yml --tags config
# ansible-playbook site.yml --skip-tags install
```

## 5. 变量与模板

### 5.1 变量优先级（从低到高）

1. role defaults
2. inventory group_vars
3. inventory host_vars
4. playbook group_vars
5. playbook host_vars
6. host facts
7. play vars
8. play vars_prompt
9. play vars_files
10. registered vars
11. set_fact
12. role vars
13. block vars
14. task vars
15. extra vars（-e，最高优先级）

### 5.2 Jinja2 模板

```jinja2
# nginx.conf.j2
worker_processes {{ ansible_processor_vcpus }};
worker_connections {{ nginx_worker_connections | default(1024) }};

{% if nginx_ssl_enabled %}
server {
    listen 443 ssl;
    server_name {{ nginx_server_name }};
    ssl_certificate {{ nginx_ssl_cert }};
    ssl_certificate_key {{ nginx_ssl_key }};
{% else %}
server {
    listen 80;
    server_name {{ nginx_server_name }};
{% endif %}

    root {{ nginx_docroot }};

{% for upstream in nginx_upstreams %}
upstream {{ upstream.name }} {
{% for server in upstream.servers %}
    server {{ server.host }}:{{ server.port }};
{% endfor %}
}
{% endfor %}
}
```

### 5.3 注册变量

```yaml
- name: Check if file exists
  stat:
    path: /etc/nginx/nginx.conf
  register: nginx_conf

- name: Backup config
  copy:
    src: /etc/nginx/nginx.conf
    dest: /etc/nginx/nginx.conf.bak
  when: nginx_conf.stat.exists

- name: Get disk usage
  command: df -h /
  register: disk_usage
  changed_when: false

- name: Show disk usage
  debug:
    msg: "{{ disk_usage.stdout_lines }}"
```

## 6. Role

### 6.1 目录结构

```
roles/nginx/
├── defaults/
│   └── main.yml          # 默认变量（最低优先级）
├── vars/
│   └── main.yml          # 角色变量（高优先级）
├── tasks/
│   └── main.yml          # 主任务
├── handlers/
│   └── main.yml          # 处理器
├── templates/
│   └── nginx.conf.j2     # 模板文件
├── files/
│   └── mime.types        # 静态文件
├── meta/
│   └── main.yml          # 依赖声明
└── tests/
    ├── inventory
    └── test.yml
```

### 6.2 使用 Role

```yaml
- name: Deploy web server
  hosts: webservers
  roles:
  - role: nginx
    vars:
      nginx_worker_connections: 4096
  - role: app
  - role: monitoring
    tags: monitoring
```

### 6.3 ansible-galaxy

```bash
ansible-galaxy init nginx                 # 初始化 Role
ansible-galaxy install geerlingguy.nginx  # 安装社区 Role
ansible-galaxy search nginx               # 搜索 Role
ansible-galaxy list                       # 列出已安装
ansible-galaxy remove geerlingguy.nginx   # 卸载

# requirements.yml
- src: geerlingguy.nginx
- src: geerlingguy.docker
- src: https://github.com/user/myrole.git
  version: v1.0.0

ansible-galaxy install -r requirements.yml
```

## 7. 高级功能

### 7.1 Vault 加密

```bash
ansible-vault create secrets.yml          # 创建加密文件
ansible-vault edit secrets.yml            # 编辑
ansible-vault encrypt secrets.yml         # 加密已有文件
ansible-vault decrypt secrets.yml         # 解密
ansible-vault view secrets.yml            # 查看
ansible-vault rekey secrets.yml           # 更换密码

ansible-playbook site.yml --ask-vault-pass
ansible-playbook site.yml --vault-password-file .vault_pass
```

### 7.2 异步任务

```yaml
- name: Long running task
  command: /opt/app/upgrade.sh
  async: 3600
  poll: 0
  register: upgrade_result

- name: Wait for upgrade
  async_status:
    jid: "{{ upgrade_result.ansible_job_id }}"
  register: job_result
  until: job_result.finished
  retries: 60
  delay: 60
```

## 8. AWX/Tower

AWX 是 Ansible Tower 的开源版本，提供 Web 管理界面。

```bash
# AWX 部署
git clone https://github.com/ansible/awx.git
cd awx
ansible-playbook -i inventory install.yml
```

核心功能：
- 作业模板（Job Template）：定义 Playbook 执行参数
- 工作流（Workflow）：编排多个作业模板
- RBAC：基于角色的访问控制
- 凭证管理：安全存储 SSH 密钥/密码
- 调度：定时执行作业
- 通知：集成邮件/Slack/Webhook

## 9. 面试题

### 1. Ansible 的幂等性如何保证？

- 模块内部检查当前状态与期望状态
- 状态一致时不做变更（changed: false）
- `shell`/`command` 模块不保证幂等，需 `creates`/`changed_when` 辅助

### 2. Handler 和 Task 的区别？

- Handler 被 `notify` 触发，只在有变更时执行
- Handler 在 Play 结束时统一执行，同一 Handler 多次 notify 只执行一次
- 适合重启服务/重载配置等操作

### 3. 如何加速 Ansible 执行？

1. 增加 `forks`（默认5，建议50+）
2. 启用 `pipelining`（减少 SSH 连接数）
3. 启用 `fact_caching`（避免每次收集 Facts）
4. 使用 `strategy: free`（不等待其他主机）
5. 使用 `async` 并行执行长任务
