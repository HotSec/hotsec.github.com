# make与new
 
## 区别

- 作用变量类型不同：new 给 string, int, array 分配内存，make 给 slice, map, channel 分配内存；
- 返回类型不一样：new返回指向变量的指针，make返回变量本身；
- 处理方式不同：new 分配的空间被置零。make 分配空间后，会进行初始化；

## 相同点

- 都在堆上分配内存；
