# Lua 设计模式

## 单例模式

```lua
local Singleton = {}
Singleton.__index = Singleton

local instance = nil

function Singleton.getInstance()
    if not instance then
        instance = setmetatable({
            config = {},
            initialized = false,
        }, Singleton)
        instance:_init()
    end
    return instance
end

function Singleton:_init()
    if self.initialized then return end
    self.config = { host = "localhost", port = 8080 }
    self.initialized = true
end

function Singleton:get(key)
    return self.config[key]
end

function Singleton:set(key, value)
    self.config[key] = value
end

local s1 = Singleton.getInstance()
local s2 = Singleton.getInstance()
assert(s1 == s2)
```

***

## 观察者模式

```lua
local EventEmitter = {}
EventEmitter.__index = EventEmitter

function EventEmitter.new()
    return setmetatable({
        _handlers = {},
    }, EventEmitter)
end

function EventEmitter:on(event, handler)
    self._handlers[event] = self._handlers[event] or {}
    table.insert(self._handlers[event], handler)
    return self
end

function EventEmitter:off(event, handler)
    local handlers = self._handlers[event]
    if not handlers then return self end
    for i, h in ipairs(handlers) do
        if h == handler then
            table.remove(handlers, i)
            break
        end
    end
    return self
end

function EventEmitter:emit(event, ...)
    local handlers = self._handlers[event]
    if not handlers then return self end
    for _, h in ipairs(handlers) do
        h(...)
    end
    return self
end

function EventEmitter:once(event, handler)
    local function wrapper(...)
        self:off(event, wrapper)
        handler(...)
    end
    self:on(event, wrapper)
    return self
end

local emitter = EventEmitter.new()

emitter:on("data", function(data)
    print("Received:", data)
end)

emitter:once("ready", function()
    print("System ready!")
end)

emitter:emit("data", "hello")
emitter:emit("ready")
emitter:emit("ready")
```

***

## 工厂模式

```lua
local Shape = {}
Shape.__index = Shape

function Shape.new(type, opts)
    local cls = Shape._registry[type]
    if not cls then
        error("Unknown shape type: " .. tostring(type), 2)
    end
    return cls.new(opts)
end

Shape._registry = {}

function Shape.register(type, cls)
    Shape._registry[type] = cls
end

local Circle = {}
Circle.__index = Circle

function Circle.new(opts)
    return setmetatable({
        radius = opts.radius or 1,
    }, Circle)
end

function Circle:area()
    return math.pi * self.radius ^ 2
end

function Circle:perimeter()
    return 2 * math.pi * self.radius
end

Shape.register("circle", Circle)

local Rectangle = {}
Rectangle.__index = Rectangle

function Rectangle.new(opts)
    return setmetatable({
        width = opts.width or 1,
        height = opts.height or 1,
    }, Rectangle)
end

function Rectangle:area()
    return self.width * self.height
end

function Rectangle:perimeter()
    return 2 * (self.width + self.height)
end

Shape.register("rectangle", Rectangle)

local c = Shape.new("circle", {radius = 5})
local r = Shape.new("rectangle", {width = 3, height = 4})
print(c:area())
print(r:area())
```

***

## 策略模式

```lua
local SortStrategy = {
    quick = function(arr)
        if #arr <= 1 then return arr end
        local pivot = arr[1]
        local left, right = {}, {}
        for i = 2, #arr do
            if arr[i] <= pivot then
                left[#left + 1] = arr[i]
            else
                right[#right + 1] = arr[i]
            end
        end
        local sorted_left = SortStrategy.quick(left)
        local sorted_right = SortStrategy.quick(right)
        local result = {}
        for _, v in ipairs(sorted_left) do result[#result + 1] = v end
        result[#result + 1] = pivot
        for _, v in ipairs(sorted_right) do result[#result + 1] = v end
        return result
    end,

    bubble = function(arr)
        local a = {table.unpack(arr)}
        for i = 1, #a do
            for j = 1, #a - i do
                if a[j] > a[j + 1] then
                    a[j], a[j + 1] = a[j + 1], a[j]
                end
            end
        end
        return a
    end,
}

local Sorter = {}
Sorter.__index = Sorter

function Sorter.new(strategy_name)
    return setmetatable({
        strategy = SortStrategy[strategy_name or "quick"],
    }, Sorter)
end

function Sorter:set_strategy(name)
    self.strategy = SortStrategy[name]
end

function Sorter:sort(arr)
    return self.strategy(arr)
end

local sorter = Sorter.new("bubble")
local sorted = sorter:sort({5, 3, 8, 1, 9})
sorter:set_strategy("quick")
```

***

## 装饰器模式

```lua
local Component = {}
Component.__index = Component

function Component.new()
    return setmetatable({}, Component)
end

function Component:operation()
    return "base"
end

local Decorator = {}
Decorator.__index = Decorator

function Decorator.new(component)
    return setmetatable({
        component = component,
    }, Decorator)
end

function Decorator:operation()
    return self.component:operation()
end

local LoggingDecorator = {}
LoggingDecorator.__index = LoggingDecorator

function LoggingDecorator.new(component)
    local self = Decorator.new(component)
    setmetatable(self, LoggingDecorator)
    return self
end

function LoggingDecorator:operation()
    print("[LOG] Before operation")
    local result = Decorator.operation(self)
    print("[LOG] After operation:", result)
    return result
end

local CachingDecorator = {}
CachingDecorator.__index = CachingDecorator

function CachingDecorator.new(component)
    local self = Decorator.new(component)
    self._cache = {}
    setmetatable(self, CachingDecorator)
    return self
end

function CachingDecorator:operation(key)
    if self._cache[key] then
        print("[CACHE] Hit:", key)
        return self._cache[key]
    end
    local result = Decorator.operation(self)
    self._cache[key] = result
    return result
end

local comp = Component.new()
local logged = LoggingDecorator.new(comp)
local cached = CachingDecorator.new(logged)
cached:operation("test")
```

***

## 状态模式

```lua
local TrafficLight = {}
TrafficLight.__index = TrafficLight

local states = {
    red = {
        color = "red",
        duration = 30,
        next = "green",
    },
    green = {
        color = "green",
        duration = 25,
        next = "yellow",
    },
    yellow = {
        color = "yellow",
        duration = 5,
        next = "red",
    },
}

function TrafficLight.new()
    return setmetatable({
        state = states.red,
        timer = 0,
    }, TrafficLight)
end

function TrafficLight:tick()
    self.timer = self.timer + 1
    if self.timer >= self.state.duration then
        self.state = states[self.state.next]
        self.timer = 0
    end
end

function TrafficLight:color()
    return self.state.color
end

local light = TrafficLight.new()
for i = 1, 65 do
    light:tick()
    print(i, light:color())
end
```

***

## 迭代器模式

```lua
local function range_iter(t, i)
    i = i + 1
    if i > t.stop then return nil end
    return i, i * t.step
end

local function range(start, stop, step)
    step = step or 1
    return range_iter, {stop = stop, step = step}, start - 1
end

for i, v in range(1, 10, 2) do
    print(i, v)
end

local function filter_iter(t, i)
    while true do
        i = i + 1
        if i > #t.data then return nil end
        if t.pred(t.data[i]) then
            return i, t.data[i]
        end
    end
end

local function filter(data, pred)
    return filter_iter, {data = data, pred = pred}, 0
end

local nums = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10}
for i, v in filter(nums, function(x) return x % 2 == 0 end) do
    print(i, v)
end
```

***

## 对象池模式

```lua
local Pool = {}
Pool.__index = Pool

function Pool.new(factory, reset_fn, max_size)
    return setmetatable({
        _pool = {},
        _factory = factory,
        _reset = reset_fn,
        _max = max_size or 100,
    }, Pool)
end

function Pool:acquire()
    local obj = table.remove(self._pool)
    if not obj then
        obj = self._factory()
    end
    return obj
end

function Pool:release(obj)
    if #self._pool < self._max then
        if self._reset then
            self._reset(obj)
        end
        self._pool[#self._pool + 1] = obj
    end
end

function Pool:size()
    return #self._pool
end

local conn_pool = Pool.new(
    function()
        return {id = math.random(1000), active = true}
    end,
    function(conn)
        conn.active = false
        conn.query_count = 0
    end,
    10
)

local conn = conn_pool:acquire()
conn.active = true
conn.query_count = 5
conn_pool:release(conn)
print("Pool size:", conn_pool:size())
```

***

## 发布-订阅模式

```lua
local PubSub = {}
PubSub.__index = PubSub

function PubSub.new()
    return setmetatable({
        _topics = {},
    }, PubSub)
end

function PubSub:subscribe(topic, callback)
    self._topics[topic] = self._topics[topic] or {}
    local sub_id = #self._topics[topic] + 1
    self._topics[topic][sub_id] = callback
    return sub_id
end

function PubSub:unsubscribe(topic, sub_id)
    if self._topics[topic] then
        self._topics[topic][sub_id] = nil
    end
end

function PubSub:publish(topic, ...)
    local subscribers = self._topics[topic]
    if not subscribers then return end
    for _, callback in pairs(subscribers) do
        callback(...)
    end
end

local bus = PubSub.new()

local sub1 = bus:subscribe("user.created", function(user)
    print("Welcome email for:", user.name)
end)

local sub2 = bus:subscribe("user.created", function(user)
    print("Log user creation:", user.id)
end)

bus:publish("user.created", {id = 1, name = "Alice"})
bus:unsubscribe("user.created", sub2)
bus:publish("user.created", {id = 2, name = "Bob"})
```
