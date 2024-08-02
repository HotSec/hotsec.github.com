# CGO编程

- 最简cgo程序

```go
package main

import "C"

func main() {
    println("hello cgo!")
}

```

```go
package main

/*
#include <stdio.h>

static void SayHello(const char* s) {
    puts(s);
}
*/
import "C"

func main() {
    C.SayHello(C.CString("Hello, World\n"))
}
```

hello.c

```c
// hello.c

#include <stdio.h>

void SayHello(const char* s) {
    puts(s);
}

```

hello.go

```go
// hello.go
package main

//void SayHello(const char* s);
import "C"

func main() {
    C.SayHello(C.CString("Hello, World\n"))
}
```

- 类型转换

| C 语言类型             | CGO 类型    | Go 语言类型 |
| ---------------------- | ----------- | ----------- |
| char                   | C.char      | byte        |
| singed char            | C.schar     | int8        |
| unsigned char          | C.uchar     | uint8       |
| short                  | C.short     | int16       |
| unsigned short         | C.ushort    | uint16      |
| int                    | C.int       | int32       |
| unsigned int           | C.uint      | uint32      |
| long                   | C.long      | int32       |
| unsigned long          | C.ulong     | uint32      |
| long long int          | C.longlong  | int64       |
| unsigned long long int | C.ulonglong | uint64      |
| float                  | C.float     | float32     |
| double                 | C.double    | float64     |
| size_t                 | C.size_t    | uint        |
