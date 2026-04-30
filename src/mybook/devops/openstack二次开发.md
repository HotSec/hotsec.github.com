# openstack

## [#](https://hotsec.github.io/ops/openstack%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91.html#dev%E7%8E%AF%E5%A2%83)dev环境

[DevStack — DevStack 文档 (openstack.org)(opens new window)](https://docs.openstack.org/devstack/latest/)

```text

git clone https://opendev.org/openstack/devstack
cd devstack
touch repo.local.conf
cat repo.local.conf
[[local|localrc]]
ADMIN_PASSWORD=secret
DATABASE_PASSWORD=$ADMIN_PASSWORD
RABBIT_PASSWORD=$ADMIN_PASSWORD
SERVICE_PASSWORD=$ADMIN_PASSWORD
./stack.sh
```

![1700985089837](https://hotsec.github.io/assets/img/1700985089837.b45df765.png)

![1700985395893](https://hotsec.github.io/assets/img/1700985395893.fb451f27.png)

![1701054315775](https://hotsec.github.io/assets/img/1701054315775.578c5162.png)

![1701054512722](https://hotsec.github.io/assets/img/1701054512722.7756da5b.png)

安装mysql

`yum -y install mariadb mariadb-server python2-PyMySQL`

设置开机自启

```bash
[root@controller vagrant]# systemctl daemon-reload             s/mariadb.service to /usr/lib/syste
[root@controller vagrant]# systemctl enable mariadb.service
Created symlink from /etc/systemd/system/multi-user.target.wants/mariadb.service to /usr/lib/systemd/system/mariadb.service.
[root@controller vagrant]# systemctl start mariadb.service
```

配置数据库

```bash

```

初始化mysql

```bash
[root@controller vagrant]# mysql_secure_installation

NOTE: RUNNING ALL PARTS OF THIS SCRIPT IS RECOMMENDED FOR ALL MariaDB
      SERVERS IN PRODUCTION USE!  PLEASE READ EACH STEP CAREFULLY!

In order to log into MariaDB to secure it, we'll need the current
password for the root user.  If you've just installed MariaDB, and
you haven't set the root password yet, the password will be blank,
so you should just press enter here.

Enter current password for root (enter for none):
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
Enter current password for root (enter for none):
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: YES)
Enter current password for root (enter for none):
OK, successfully used password, moving on...

Setting the root password ensures that nobody can log into the MariaDB
root user without the proper authorisation.

Set root password? [Y/n] y
New password:
Re-enter new password:
Password updated successfully!
Reloading privilege tables..
 ... Success!

By default, a MariaDB installation has an anonymous user, allowing anyone
to log into MariaDB without having to have a user account created for
them.  This is intended only for testing, and to make the installation
go a bit smoother.  You should remove them before moving into aproduction environment.

Remove anonymous users? [Y/n] y
 ... Success!

Normally, root should only be allowed to connect from 'localhost'.  This
ensures that someone cannot guess at the root password from the network.

Disallow root login remotely? [Y/n] y
 ... Success!

By default, MariaDB comes with a database named 'test' that anyone can
access.  This is also intended only for testing, and should be removed
before moving into a production environment.

Remove test database and access to it? [Y/n] y

- Dropping test database...
  ... Success!
- Removing privileges on test database...
  ... Success!

Reloading the privilege tables will ensure that all changes made so far
will take effect immediately.

Reload privilege tables now? [Y/n] y
 ... Success!

Cleaning up...

All done!  If you've completed all of the above steps, your MariaDB
installation should now be secure.

Thanks for using MariaDB!

```

设置mysql root用户权限

```bash
root@controller vagrant]# mysql -uroot -pmysql 
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 13
Server version: 5.5.68-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.
MariaDB [(none)]> use mysql;
Reading table information for completion of table and column names
You can turn off this feature to get a quicker startup with -A 

Database changed
MariaDB [mysql]> update user set Host='%' where User='root' and Host='localhost' and user='root';
Query OK, 0 rows affected (0.00 sec)
Rows matched: 0  Changed: 0  Warnings: 0

MariaDB [mysql]> flush privileges;
Query OK, 0 rows affected (0.00 sec)

MariaDB [mysql]> quit
Bye
[root@controller vagrant]# mysql -uroot -pmysql
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 14
Server version: 5.5.68-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]>
```

![1701054642465](https://hotsec.github.io/assets/img/1701054642465.5c1bb38d.png)

![1701054852021](https://hotsec.github.io/assets/img/1701054852021.7a6994f4.png)

![1701055286542](https://file+.vscode-resource.vscode-cdn.net/f%3A/Desktop/%E4%B8%B4%E6%97%B6%E8%AE%B0%E5%BD%95/note/sec-dev-ops-study/docs/ops/image/openstack%E4%BA%8C%E6%AC%A1%E5%BC%80%E5%8F%91/1701055286542.png)![1701055322749](https://hotsec.github.io/ops/image/openstack2dev/1701055322749.png)

安装openstackclient

```text
pip install python-openstackclient
```

yum -y install centos-release-openstack-train

![1701064945889](https://hotsec.github.io/assets/img/1701064945889.7dadedd5.png)

![1701065826629](https://hotsec.github.io/assets/img/1701065826629.a3d36cc3.png)

```text
[root@controller yum.repos.d]# mysql -uroot -pmysql
Welcome to the MariaDB monitor.  Commands end with ; or \g.
Your MariaDB connection id is 15
Server version: 5.5.68-MariaDB MariaDB Server

Copyright (c) 2000, 2018, Oracle, MariaDB Corporation Ab and others.

Type 'help;' or '\h' for help. Type '\c' to clear the current input statement.

MariaDB [(none)]> create database keystone default character set utf8;
Query OK, 1 row affected (0.00 sec)

MariaDB [(none)]> grant all privileges on keystone.* to 'keystone'@'localhost' identified by 'openstack';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> grant all privileges on keystone.* to 'keystone'@'%' identified by 'openstack';
Query OK, 0 rows affected (0.00 sec)

MariaDB [(none)]> quit
Bye
```

```shell
yum -y install PackageKit-backend
yum -y install yum-utils
yum -y install qpid-proton-c-0.26.0-2.el7.x86_64
yum -y install openstack-keystone httpd mod_wsgi

cat > /etc/keystone/admin-openrc.sh <<EOF
export OS_USERNAME=admin
export OS_PASSWORD=openstack2022
export OS_PROJECT_NAME=admin
export OS_USER_DOMAIN_NAME=Default
export OS_AUTH_URL=http://controller:5000/v3
export OS_IDENTITY_API_VERSION=3
export OS_IMAGE_API_VERSION=2
EOF
```
