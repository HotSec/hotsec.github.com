# playwright

## 入门

`https://playwright.dev/`

```bash
pip install --upgrade pip
pip install playwright
playwright install
```

`PLAYWRIGHT_BROWSERS_PATH=0 playwright install chromium pyinstaller -F main.py`

[控制台](https://www.zhihu.com/search?q=%E6%8E%A7%E5%88%B6%E5%8F%B0&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)启动录制

playwright codegen [options] [url]

```python
-o, --output ：保存生成脚本
–target ：生成的脚本语言，可以设置javascript, test, python, python-async和csharp，默认为python
-b, --browser ：要使用的浏览器，可以选择cr, chromium, ff, firefox, wk和webkit，默认chromium。
–channel ：chromium版本，比如chrome, chrome-beta, msedge-dev等
–color-scheme ：模拟器的颜色主题，可选择light 或者 dark样式
–device ：模拟的设备
–save-storage ：保存上下文状态，用于保存cookies 和localStorage，可用它来实现重用。例如playwright codegen --save-storage=auth.json
–load-storage ：加载–save-storage 保存的数据，重用认证数据。
–proxy-server ：指定代理服务器
–timezone ： 指定时区
–geolocation ：指定地理位置坐标
–lang ：指定语言/地区，比如中国大陆：zh-CN
–timeout ：超时时间，定位毫秒，默认10000ms
–user-agent ：用户代理
–viewport-size ：浏览器窗口大小
-h, --help ：查看帮助信息
```

例如：

```text
playwright codegen -o test_playwright.py --target python  -b chromium --device="iPhone 12 Pro" https://www.baidu.com/

playwright open https://www.baidu.com/ # 默认使用Chromium打开
playwright wk https://www.baidu.com/ # 使用WebKit打开
playwright open --device="iPhone 12 Pro" https://www.baidu.com/ # 使用iPhone 12 Pro模拟器打开
```

基本用法

### 常见配置参数

headless，slow_mo，viewport，locale，timezone，[color_scheme](https://www.zhihu.com/search?q=color_scheme&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)，geolocation，user_agent， timeout, proxy

### 同步模式

```text
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
 # 创建一个浏览器实例； headless：是否无头；slow_mo放慢执行速度

 # pixel_2 = playwright.devices['Pixel 2']  # Pixel 2 一款安卓手机
 proxy_ip = {
            'server': 'http://',
            'username': '',
            'password': '',
        }
    browser = p.chromium.launch(headless=False, slow_mo=100, proxy=proxy_ip)
 context = browser.new_context(
            viewport={'width': 1800, 'height': 800}, # 窗口大小
            locale='zh-CN',  #语言zh-CN/en-EN
            timezone='Europe/Rome',   #时区
            color_scheme='dark', # 颜色
            geolocation={"longitude": 48.858455, "latitude": 2.294474} # 地理位置
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36', # 浏览器,
            timeout=10000, # 超时
            # **pixel_2,
        )

    # 创建两个浏览器上下文
    page = browser.new_page()
    page.goto('http://www.baidu.com')
    print(page.title)
    browser.close()
```

### 异步模式

```text
import asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()
        await page.goto("http://www.baidu.com")
        print(await page.title())
        await browser.close()

asyncio.run(main())
```

### 防止WebDriver 被检测

```text
js = """ Object.defineProperties(navigator,{webdriver:{get:()=>undefined}}; """ page.add_init_script(js)  
或者 page.add_init_script("""Object.defineProperties(navigator, {webdriver:{get:()=>undefined}});""")
```

### 获取源码，文本，属性

获取源码: .content()

page.wait_for_load_state('networkidle') html = page.content()

获取文本: .text_content()

*# ul->li下* brand = element.query_selector('text=品牌：').text_content()  name = ele_items.query_selector('section > div._3KXtu._3jY37 > a').text_content()

获取属性: .[get_attribute](https://www.zhihu.com/search?q=get_attribute&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)()

*# ul->li下* link = element.query_selector('h5 a').get_attribute('href')

wait_for_load_state

"commit ": 接收到网络响应且文档开始加载时(仅显示了页面默认窗口视图下的元素) "[domcontentloaded](https://www.zhihu.com/search?q=domcontentloaded&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)": 认为在 DOMContentLoaded 事件完成时(显示了完整页面) "load": 在 load 事件完成时操作完成(含了所有图片资源) "[networkidle](https://www.zhihu.com/search?q=networkidle&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)": 至少 500 毫秒内没有网络连接时操作完成  页面加载的整个状态变化 Commit -> DOMContentLoaded -> load -> networkidle

### 监听 response 事件：page.on()

```text
"commit ": 接收到网络响应且文档开始加载时(仅显示了页面默认窗口视图下的元素)
"domcontentloaded": 认为在 DOMContentLoaded 事件完成时(显示了完整页面)
"load": 在 load 事件完成时操作完成(含了所有图片资源)
"networkidle": 至少 500 毫秒内没有网络连接时操作完成

页面加载的整个状态变化
Commit -> DOMContentLoaded -> load -> networkidle
```

***监听弹窗***

with page.expect_popup() as popup:  page.evaluate('window.open()') popup.value.goto('[http://www.**baidu.com**](https://link.zhihu.com/?target=http%3A//www.baidu.com)')

***监听请求***

with page.expect_request('**/*login*.png') as first:  page.goto('[http://www.**baidu.com**](https://link.zhihu.com/?target=http%3A//www.baidu.com)') print(first.value.url)

**传参监听**

page.on('[response](https://www.zhihu.com/search?q=response&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)', lambda response: on_response(response, id)) for (url, id) in urls:   pass

### **滚动**

下拉滚动条

page.evaluate("var q=document.documentElement.scrollTop=15000")

鼠标滚动

page.mouse.wheel(0,7000)

### 截图

```text
 with sync_playwright() as p:
        browser = p.chromium.launch(headless=False, slow_mo=50)
        page = browser.new_page()
        page.goto("http://www.baidu.com")
        page.screenshot(path="example.png")
        browser.close()
```

### **获取cookie**

```text
browser = playwright.chromium.launch(headless=False) 
context = browser.new_context()  
cookies = context.storage_state()
cookie = '; '.join([f'{key["name"]}={key["value"]}' for key in cookies['cookies']])
```

### CSS，xpath选择器

t伪类选择器
[has-text](https://www.zhihu.com/search?q=has-text&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)()：检测包含（返回找到的所有元素）
text()：检测等于（返回第一个找到的元素）

```text
# 选择文本是 Log in 的节点，并点击
page.click("text=Log in",timeout=5000)
page.click("text=你好，请登录")

page.locator(':has-text("All products")').click() 

page.locator("#nav-bar :text('Contact us')").click()
page.locator('[data-test=login-button]').click()
page.locator("[aria-label='Sign in']").click()

# 选择 id 为 nav-bar 子孙节点 class 属性值为 contact-us-item，并点击
page.click("#nav-bar .contact-us-item")
 
# 选择文本中包含 Playwright 的 article 节点
page.click("article:has-text('Playwright')")
 
# 选择 id 为 nav-bar 节点中文本值等于 Contact us 的节点
page.click("#nav-bar :text('Contact us')")
 
# 选择 class 为 item-description 的节点，且该节点还要包含 class 为 item-promo-banner 的子节点
page.click(".item-description:has(.item-promo-banner)")
 
# 择的就是一个 input 节点，并且该 input 节点要位于文本值为 Username 的节点的右侧
page.click("input:right-of(:text('Username'))")

# xpath
page.click("xpath=//button")
```

### get_by_xxx[定位器](https://www.zhihu.com/search?q=%E5%AE%9A%E4%BD%8D%E5%99%A8&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)

●[page.get_by_text（文本，**kwargs）按文本内容定位](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-text)。
●[page.get_by_role（角色，**kwargs）按角色属性](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-role)

●[page.get_by_label（文本，**kwargs）通过关联标签的文本查找表单控件](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-label)
● [page.get_by_test_id（test_id）根据元素的属性定位元素（可以配置其他属性）](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-test-id)
[page.get_by_placeholder（文本，**kwargs）](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-placeholder)按[占位符](https://www.zhihu.com/search?q=%E5%8D%A0%E4%BD%8D%E7%AC%A6&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)查找输入

● [通过其文本替代来定位元素](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-alt-text)，通常是图像。
●[page.get_by_title（文本，**kwargs）](https://link.zhihu.com/?target=https%3A//playwright.dev/python/docs/api/class-page%23page-get-by-title)按标题定位元素。

```text
page.get_by_label("Password").fill("secret-password")

page.get_by_role("option", name="全部企业").click()
page.get_by_role("button", name="Sign in").click()

# 关闭详情弹窗
page.frame_locator("internal:attr=[title=\"详情页\"i]").locator(
                "#enterprise-details-close").click()

# 文本内容
page.get_by_text(str(select_text)).click()

# 正则匹配定位
page.get_by_role("tab", name=re.compile("风险信息", re.IGNORECASE)).click()
```

![Playwright选择器方法](https://pic1.zhimg.com/80/v2-56336a3fa6293b8235b2bdc663030f0a_720w.webp?source=1def8aca)

**[循环遍历](https://www.zhihu.com/search?q=%E5%BE%AA%E7%8E%AF%E9%81%8D%E5%8E%86&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)**ul: query_selector_all()

```text
uls = page.query_selector_all('//*[@id="YZhV9-anchor"]//table[@class="ant-table-fixed"]/tbody/tr')
for ele_items in uls:
 title = ele_items.query_selector('section > div._3KXtu._3jY37 > a').text_content()
```

同级第几个：.nth(2)

点击最后一个按钮 page.click("button >> nth=-1")  page.get_by_placeholder("请输入手机号码").nth(1).click()

文本输入：.fill()

*# 标签定位输入* page.locator('text=First Name').fill('Peter')  page.get_by_placeholder("请输入手机号码").nth(1).fill('12345678901')

[定位器过滤器](https://www.zhihu.com/search?q=%E5%AE%9A%E4%BD%8D%E5%99%A8%E8%BF%87%E6%BB%A4%E5%99%A8&search_source=Entity&hybrid_search_source=Entity&hybrid_search_extra=%7B%22sourceType%22%3A%22answer%22%2C%22sourceId%22%3A3269710925%7D)：filter

page.locator("a").filter(has_text="密码登录").click()

刷新，前进，后退

page.reload(**kwargs) *# 刷新* page.go_back(**kwargs) *# 后退* page.go_forward(**kwargs) *# 前进*

### 等待

```text
# 等待直到title元素被加载完全
page.locator("title").wait_for()   

# 会自动等待按钮加载好再执行点击
page.locator("button", has_text="sign up").click() 

# Playwright 会等待 #search 元素出现在 DOM 中
page.fill('#search', 'query')

# Playwright 会等待元素停止动画并接受点击
page.click('#search')

# 等待 #search 出现在 DOM 中
page.wait_for_selector('#search', state='attached')
# 等待 #promo 可见, 例如具有 `visibility:visible` 
page.wait_for_selector('#promo')

# 等待 #details 变得不可见, 例如通过 `display:none`.
page.wait_for_selector('#details', state='hidden')

# 等待 #promo 从 DOM 中移除
page.wait_for_selector('#promo', state='detached')


# 随机等待
page.wait_for_timeout(random.uniform(2500, 4500))
```

### 点击

* 左键点击：page.click(“id=su”)
* 点击元素左上角：page.click(‘id=su’, position={‘x’: 0, ‘y’: 0})
* Shift + click：page.click(“id=su”, modifiers=[‘Shift’])
* 强制点击：page.click(“id=su”, force=True)
* 右键点击：page.click(“id=su”, button=‘right’)
* 双击：page.dblclick(“id=su”)
* 悬停在元素上：page.hover(‘id=su’)

### **模拟键盘输入**

```bash
page = browser.new_page()
page.goto("https://keycode.info")
page.keyboard.press("a")
page.screenshot(path="a.png")
page.keyboard.press("ArrowLeft")
page.screenshot(path="arrow_left.png")
page.keyboard.press("Shift+O")
page.screenshot(path="o.png")
browser.close()


page.keyboard.type("Hello") # types instantly
page.keyboard.type("World", delay=100) # types slower, like a user
`page.press("id=kw", 'Control+A')`：
Control+A page.press('id=kw', 'Enter') # 点击回车  *# 一个字符一个字符的输入*
page.type("id=kw", "playwright", delay=100) # 每个字符延迟100ms输入
```
