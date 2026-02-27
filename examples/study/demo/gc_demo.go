package main

import (
	"fmt"
	"time"
)

func allocate() {
	_ = make([]byte, 1<<20) 
}

func test_ab() {
	chan1 := make(chan struct{})

	go func() {
		for i :=0; i< 10; i++ {
			fmt.Println("a chan1 <- ",i)
			chan1 <- struct{}{}
			if i%2 == 0 {
				fmt.Println("a",i)
			}
		}
	}()
    go func() {
		for i :=0; i < 10; i++ {
			<-chan1
			fmt.Println("b chan1 <- ",i)
			if i%2 == 1 {
				fmt.Println("b",i)
			}
		}
	}()
	select {
		case <-time.After(100*time.Millisecond):
	}

}

func main() {
	// for n := 1; n < 100000; n++ {
	// 	allocate()
	// }
	test_ab()
}

// GODEBUG=gctrace=1 ./demo
//    第xxx个gc周期 
// gc 25915 @4.541s 12%: 0.015+0.044+0.001 ms clock, 0.15+0.017/0.055/0.003+0.011 ms cpu, 3->3->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 10 P
// gc 25916 @4.542s 12%: 0.023+0.033+0.001 ms clock, 0.23+0.012/0.039/0+0.015 ms cpu, 3->3->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 10 P
// gc 25917 @4.542s 12%: 0.018+0.059+0.001 ms clock, 0.18+0.027/0.040/0+0.010 ms cpu, 3->3->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 10 P
// gc 25918 @4.542s 12%: 0.016+0.039+0.001 ms clock, 0.16+0.009/0.052/0+0.012 ms cpu, 3->3->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 10 P
// gc 25919 @4.542s 12%: 0.026+0.035+0.001 ms clock, 0.26+0.011/0.024/0+0.010 ms cpu, 3->3->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 10 P
// gc 25920 @4.542s 12%: 0.021+0.049+0.001 ms clock, 0.21+0.011/0.045/0+0.012 ms cpu, 3->3->0 MB, 4 MB goal, 0 MB stacks, 0 MB globals, 10 P


