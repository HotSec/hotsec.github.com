package main

import (
	"fmt"
	"sort"
)

type People struct {
    Name string
    Age int
}

type School struct {
    Name string
    Address string
}

func (p *People) GetName() string{
    return p.Name
}

type Student struct {
    ID int
    Score int
    People    // 将People作为Student的一个属性，注意不要加类型，这就是隐式继承
    School    // 将School作为Student的一个属性，注意不要加类型，这就是隐式继承
}

func (st *Student) SetScore(score int) {
    st.Score = score
}

func (st Student) GetScore() int{
    return st.Score
}

func DoJob(value interface{}) {
   fmt.Printf("value is %v\n", value)
}


type A interface {
    run1()
}

type B interface {
    run2()
}

// 定义嵌套接口C
type C interface {
    A
    B
    run3()
}

type Runner struct {}
    
// 实现嵌套接口A的方法
func (r Runner ) run1() {
    fmt.Println("run1!!!!")
}

// 实现嵌套接口B的方法
func (r Runner ) run2() {
    fmt.Println("run2!!!!")
}

func (r Runner ) run3() {
    fmt.Println("run3!!!!")
}



func main() {
    var funcs []func()

    for i := 0; i < 3; i++ {
        funcs = append(funcs, func() {
            fmt.Println(i)
        })
    }

    for _, f := range funcs {
        f()
    }

    slice := []int{1, 2, 3}
    
    for _, v := range slice {
        v *= 10
    }
    
    fmt.Println(slice) // 输出: [1 2 3]

    dic := map[string]int{"a": 1, "b": 2, "c": 3}

    for k, v := range dic {
        fmt.Printf("key: %s, value: %d\n", k, v)
    }


    dic = map[string]int{"a1": 1, "b2": 2, "c3": 3}
    keys := make([]string, 0, len(dic))

    for k := range dic {
        keys = append(keys, k)
    }

    sort.Strings(keys)

    for _, k := range keys {
        fmt.Printf("key: %s, value: %d\n", k, dic[k])
    }

    str := "hello 世界"
    
    for i, r := range str {
        fmt.Printf("index: %d, rune: %c\n", i, r)
    }

    str = "hello 世界"
    
    for i := 0; i < len(str); i++ {
        fmt.Printf("index: %d, byte: %x\n", i, str[i])
    }

    st := &Student{
        ID : 100,
        Score: 98,
        School : School {
            Name : "No.1 Middle School",
            Address : "123 Main St",
        },
        People : People {
            Name : "zhangsan",
            Age : 18,
        },
    }
    fmt.Printf("学生st的分数是: %d\n", st.GetScore())    // 通过指针调用定义在值类型的方法GetScore                                         // 通过指针调用定义在指针类型上的方法
    fmt.Printf("学生st的姓名是: %s\n", st.GetName())
    fmt.Printf(st.Address)
    fmt.Printf(st.School.Name)
    fmt.Printf("%d \n", st.Age)

    var x interface{}
    x = 8
    val, ok := x.(int)
    fmt.Printf("\nval is %d, ok is %t\n", val, ok)

    val1 := "10"
    DoJob(val1)

   var runner C
   runner = new(Runner)  // runner实现了C接口的所有方法
   runner.run1()
   runner.run2()
   runner.run3()
}