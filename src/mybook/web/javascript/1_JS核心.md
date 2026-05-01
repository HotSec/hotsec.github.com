# JavaScript 核心

---

## 一、数据类型

### 1.1 原始类型

```javascript
// 7 种原始类型
typeof 42           // "number"
typeof "hello"      // "string"
typeof true         // "boolean"
typeof undefined    // "undefined"
typeof null         // "object" (历史遗留 bug)
typeof Symbol()     // "symbol"
typeof 42n          // "bigint"
```

### 1.2 引用类型

```javascript
typeof {}           // "object"
typeof []           // "object"
typeof function(){} // "function"
typeof null         // "object"

// 判断数组
Array.isArray([1,2,3]) // true
```

### 1.3 类型转换

```javascript
// 隐式转换（避免使用）
"5" + 3    // "53" (字符串拼接)
"5" - 3    // 2   (数值减法)
true + 1   // 2
null + 1   // 1
undefined + 1 // NaN

// 显式转换
Number("42")     // 42
String(42)       // "42"
Boolean(0)       // false
parseInt("42px") // 42
parseFloat("3.14") // 3.14
```

---

## 二、变量声明

```javascript
// var: 函数作用域，变量提升
if (true) { var x = 1; }
console.log(x); // 1

// let: 块级作用域，不可提升
if (true) { let y = 2; }
// console.log(y); // ReferenceError

// const: 块级作用域，不可重新赋值
const z = 3;
// z = 4; // TypeError

// const 对象可修改属性
const obj = { a: 1 };
obj.a = 2; // ✅
// obj = {}; // ❌
```

---

## 三、函数

### 3.1 箭头函数

```javascript
const add = (a, b) => a + b;
const square = x => x * x;
const greet = name => `Hello, ${name}!`;

// 箭头函数没有自己的 this
const obj = {
    name: "Alice",
    sayHi: () => console.log(this.name), // ❌ undefined
    sayHello() { console.log(this.name) } // ✅ Alice
};
```

### 3.2 闭包

```javascript
function counter() {
    let count = 0;
    return {
        increment: () => ++count,
        decrement: () => --count,
        getCount: () => count,
    };
}

const c = counter();
c.increment(); // 1
c.increment(); // 2
c.getCount();  // 2
```

### 3.3 this 指向

```javascript
// 1. 默认绑定（严格模式 undefined，非严格模式 window）
function foo() { console.log(this); }
foo(); // window / undefined

// 2. 隐式绑定（调用对象）
const obj = { foo() { console.log(this); } };
obj.foo(); // obj

// 3. 显式绑定（call/apply/bind）
function greet(greeting) {
    console.log(`${greeting}, ${this.name}`);
}
greet.call({ name: "Alice" }, "Hello");   // Hello, Alice
greet.apply({ name: "Bob" }, ["Hi"]);     // Hi, Bob
const bound = greet.bind({ name: "Carol" });
bound("Hey"); // Hey, Carol

// 4. new 绑定
function Person(name) { this.name = name; }
const p = new Person("Dave"); // this → 新对象
```

---

## 四、原型链

```javascript
// 原型链继承
function Animal(name) {
    this.name = name;
}
Animal.prototype.speak = function() {
    console.log(`${this.name} makes a sound`);
};

function Dog(name, breed) {
    Animal.call(this, name);
    this.breed = breed;
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.bark = function() {
    console.log(`${this.name} barks`);
};

const d = new Dog("Rex", "Shepherd");
d.speak(); // Rex makes a sound
d.bark();  // Rex barks

// class 语法糖 (ES6)
class Animal {
    constructor(name) { this.name = name; }
    speak() { console.log(`${this.name} makes a sound`); }
}

class Dog extends Animal {
    constructor(name, breed) {
        super(name);
        this.breed = breed;
    }
    bark() { console.log(`${this.name} barks`); }
}
```

---

## 五、异步编程

### 5.1 Promise

```javascript
const fetchUser = (id) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (id > 0) resolve({ id, name: "Alice" });
            else reject(new Error("Invalid ID"));
        }, 1000);
    });
};

fetchUser(1)
    .then(user => fetchOrder(user.id))
    .then(order => fetchProduct(order.productId))
    .catch(err => console.error(err))
    .finally(() => console.log("done"));
```

### 5.2 async/await

```javascript
async function getUserData(id) {
    try {
        const user = await fetchUser(id);
        const order = await fetchOrder(user.id);
        const product = await fetchProduct(order.productId);
        return { user, order, product };
    } catch (err) {
        console.error(err);
    }
}

// 并发
async function fetchAll() {
    const [users, orders, products] = await Promise.all([
        fetchUsers(),
        fetchOrders(),
        fetchProducts(),
    ]);
    return { users, orders, products };
}
```

### 5.3 事件循环

```
┌───────────────────────┐
│      Call Stack        │  ← 同步代码执行
├───────────────────────┤
│   Microtask Queue      │  ← Promise.then / MutationObserver
├───────────────────────┤
│   Macrotask Queue      │  ← setTimeout / setInterval / I/O
└───────────────────────┘

执行顺序：
1. 执行同步代码
2. 清空微任务队列
3. 取一个宏任务执行
4. 清空微任务队列
5. 重复 3-4
```

```javascript
console.log("1");              // 同步
setTimeout(() => console.log("2"), 0);  // 宏任务
Promise.resolve().then(() => console.log("3")); // 微任务
console.log("4");              // 同步

// 输出: 1, 4, 3, 2
```

---

## 六、ES6+ 核心特性

### 6.1 解构赋值

```javascript
const { name, age } = { name: "Alice", age: 25 };
const [first, second, ...rest] = [1, 2, 3, 4, 5];

// 函数参数默认值
function greet(name = "World") {
    console.log(`Hello, ${name}!`);
}

// 重命名 + 默认值
const { name: userName = "Anonymous" } = user;
```

### 6.2 展开运算符

```javascript
const a = [1, 2, 3];
const b = [...a, 4, 5]; // [1, 2, 3, 4, 5]

const obj1 = { a: 1, b: 2 };
const obj2 = { ...obj1, c: 3 }; // { a: 1, b: 2, c: 3 }

// 浅拷贝
const copy = [...original];
const objCopy = { ...originalObj };
```

### 6.3 Map / Set / WeakMap / WeakSet

```javascript
const map = new Map();
map.set("key", "value");
map.set(42, "number key");
map.get("key");   // "value"
map.has(42);      // true
map.size;         // 2

const set = new Set([1, 2, 3, 2, 1]);
set.add(4);
set.has(2);       // true
set.size;         // 4

// WeakMap: 键必须是对象，不影响 GC
const weakMap = new WeakMap();
let obj = {};
weakMap.set(obj, "data");
obj = null; // 可被 GC 回收
```

### 6.4 Proxy / Reflect

```javascript
const handler = {
    get(target, prop) {
        console.log(`accessing ${prop}`);
        return Reflect.get(target, prop);
    },
    set(target, prop, value) {
        console.log(`setting ${prop} = ${value}`);
        return Reflect.set(target, prop, value);
    }
};

const proxy = new Proxy({ name: "Alice" }, handler);
proxy.name;       // accessing name → "Alice"
proxy.age = 25;   // setting age = 25
```

### 6.5 模块化

```javascript
// ESM (ES Modules)
export const name = "Alice";
export function greet() { /* ... */ }
export default class App { /* ... */ }

import App, { name, greet } from './module.js';
import * as mod from './module.js';

// 动态 import
const module = await import('./module.js');
```

---

## 七、DOM 与事件

### 7.1 DOM 操作

```javascript
const el = document.getElementById("app");
const list = document.querySelectorAll(".item");

el.textContent = "Hello";
el.innerHTML = "<span>Hi</span>";
el.classList.add("active");
el.classList.toggle("hidden");
el.setAttribute("data-id", "42");
el.style.color = "red";

const newEl = document.createElement("div");
newEl.textContent = "New";
el.appendChild(newEl);
```

### 7.2 事件机制

```javascript
// 事件冒泡（默认）
el.addEventListener("click", (e) => {
    console.log("clicked", e.target);
});

// 事件捕获
el.addEventListener("click", handler, { capture: true });

// 事件委托
document.addEventListener("click", (e) => {
    if (e.target.matches(".item")) {
        handleClick(e.target);
    }
});

// 阻止冒泡/默认行为
e.stopPropagation();
e.preventDefault();
```
