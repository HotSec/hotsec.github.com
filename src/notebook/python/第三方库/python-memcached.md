# python-memcached

## 安装

`pip install python-memcached`

## 使用

```python
import memcache
 
mc = memcache.Client(['10.211.55.4:12000'], debug=True)
# mc = memcache.Client([('1.1.1.1:12000', 1), ('1.1.1.2:12000', 2), ('1.1.1.3:12000', 1)], debug=True)
 
mc.set('k1', 'v1')
mc.set("foo", "bar")
ret = mc.get('foo')
print(ret)

mc.add('k1', 'v1')

mc.replace('kkkk','999')

# set         设置一个键值对，如果key不存在，则创建，如果key存在，则修改
# set_multi   设置多个键值对，如果key不存在，则创建，如果key存在，则修改

mc.set_multi({'key1': 'val1', 'key2': 'val2'})

# delete            在Memcached中删除指定的一个键值对
# delete_multi    在Memcached中删除指定的多个键值对

mc.delete('key0')
mc.delete_multi(['key1', 'key2'])



# get            获取一个键值对
# get_multi   获取多一个键值对
val = mc.get('key0')
item_dict = mc.get_multi(["key1", "key2", "key3"])

# append    修改指定key的值，在该值 后面 追加内容
# prepend   修改指定key的值，在该值 前面 插入内容
mc.append('k1', 'after')
# k1 = "v1after"
 
mc.prepend('k1', 'before')
# k1 = "beforev1after"

# incr  自增，将Memcached中的某一个值增加 N （ N默认为1 ）
# decr 自减，将Memcached中的某一个值减少 N （ N默认为1 ）
mc.set('k1', '123')
mc.incr('k1')
# k1 = 124
mc.incr('k1', 10)
# k1 = 134
mc.decr('k1')
# k1 = 133
mc.decr('k1', 10)
# k1 = 123


v = mc.gets('product_count')
# ...
# 如果有人在gets之后和cas之前修改了product_count，那么，下面的设置将会执行失败，剖出异常，从而避免非正常数据的产生
mc.cas('product_count', "899")
# 质上每次执行gets时，会从memcache中获取一个自增的数字，
# 通过cas去修改gets的值时，会携带之前获取的自增值和memcache中的自增值进行比较，
# 如果相等，则可以提交，如果不想等，那表示在gets和cas执行之间，
# 又有其他人执行了gets（获取了缓冲的指定值）， 如此一来有可能出现非正常数据，则不允许修改。
```
