# gin

## hello world

```go
import "github.com/gin-gonic/gin"


func main() {
    // 创建一个 gin Engine，本质上是一个 http Handler
    mux := gin.Default()
    // 注册中间件
    mux.Use(myMiddleWare)
    // 注册一个 path 为 /ping 的处理函数
    mux.POST("/ping", func(c *gin.Context) {
        c.JSON(http.StatusOK, "pone")
    })
    // 运行 http 服务
    if err := mux.Run(":8080"); err != nil {
        panic(err)
    }
}
```


> `https://mp.weixin.qq.com/s?__biz=MzkxMjQzMjA0OQ==&mid=2247484076&idx=1&sn=9492d326c820625700345a881b58a849&chksm=c10c4c72f67bc56494562691a770e2ef583a45e92dde85dbf2a22e3801d2e7e86705b73d0f45&cur_album_id=2709593649634033668&scene=189#wechat_redirect`