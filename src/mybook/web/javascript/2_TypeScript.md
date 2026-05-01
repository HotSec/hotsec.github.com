# TypeScript 详解

---

## 一、基础类型

```typescript
let str: string = "hello";
let num: number = 42;
let bool: boolean = true;
let n: null = null;
let u: undefined = undefined;
let big: bigint = 100n;
let sym: symbol = Symbol();

// 数组
let arr1: number[] = [1, 2, 3];
let arr2: Array<number> = [1, 2, 3];

// 元组
let tuple: [string, number] = ["hello", 42];

// 枚举
enum Direction {
    Up = "UP",
    Down = "DOWN",
    Left = "LEFT",
    Right = "RIGHT",
}

// any / unknown / void / never
let anything: any = 42;           // 放弃类型检查
let safe: unknown = 42;           // 安全的 any，使用前需收窄
function log(msg: string): void { } // 无返回值
function throwError(): never { throw new Error(); } // 永不返回
```

---

## 二、接口与类型别名

### 2.1 interface

```typescript
interface User {
    id: number;
    name: string;
    email?: string;           // 可选属性
    readonly createdAt: Date;  // 只读属性
}

// 接口继承
interface Admin extends User {
    role: "admin";
    permissions: string[];
}

// 接口合并（声明合并）
interface Window {
    myCustomProp: string;
}
```

### 2.2 type

```typescript
type User = {
    id: number;
    name: string;
};

// 联合类型
type Status = "active" | "inactive" | "banned";
type ID = number | string;

// 交叉类型
type Employee = User & {
    department: string;
    salary: number;
};

// 条件类型
type IsString<T> = T extends string ? true : false;
type A = IsString<"hello">; // true
type B = IsString<42>;      // false
```

### 2.3 interface vs type

| 维度 | interface | type |
|------|-----------|------|
| 对象类型 | ✅ | ✅ |
| 联合类型 | ❌ | ✅ |
| 交叉类型 | extends | & |
| 声明合并 | ✅ | ❌ |
| 计算属性 | ❌ | ✅ |

---

## 三、泛型

### 3.1 泛型函数

```typescript
function identity<T>(value: T): T {
    return value;
}

identity<string>("hello");
identity(42); // 自动推导

// 多泛型
function map<T, U>(arr: T[], fn: (item: T) => U): U[] {
    return arr.map(fn);
}
```

### 3.2 泛型约束

```typescript
interface HasLength {
    length: number;
}

function logLength<T extends HasLength>(value: T): T {
    console.log(value.length);
    return value;
}

logLength("hello");     // ✅
logLength([1, 2, 3]);   // ✅
// logLength(42);       // ❌ number 没有 length
```

### 3.3 泛型接口/类

```typescript
interface Repository<T> {
    findById(id: string): Promise<T>;
    save(entity: T): Promise<void>;
    delete(id: string): Promise<void>;
}

class UserService implements Repository<User> {
    async findById(id: string): Promise<User> { /* ... */ }
    async save(user: User): Promise<void> { /* ... */ }
    async delete(id: string): Promise<void> { /* ... */ }
}
```

---

## 四、工具类型

```typescript
// Partial - 所有属性可选
type PartialUser = Partial<User>;

// Required - 所有属性必填
type RequiredUser = Required<User>;

// Readonly - 所有属性只读
type ReadonlyUser = Readonly<User>;

// Pick - 选取部分属性
type UserBasic = Pick<User, "id" | "name">;

// Omit - 排除部分属性
type UserWithoutEmail = Omit<User, "email">;

// Record - 键值对
type UserMap = Record<string, User>;

// Exclude - 从联合类型中排除
type NonString = Exclude<string | number | boolean, string>; // number | boolean

// Extract - 从联合类型中提取
type StringType = Extract<string | number | boolean, string>; // string

// ReturnType - 获取函数返回类型
function getUser() { return { id: 1, name: "Alice" }; }
type UserType = ReturnType<typeof getUser>; // { id: number; name: string; }

// Parameters - 获取函数参数类型
type Params = Parameters<typeof getUser>; // []

// NonNullable - 排除 null/undefined
type NonNull = NonNullable<string | null | undefined>; // string
```

---

## 五、类型守卫

```typescript
// typeof
function process(value: string | number) {
    if (typeof value === "string") {
        return value.toUpperCase(); // string
    }
    return value.toFixed(2); // number
}

// instanceof
if (error instanceof TypeError) {
    // TypeError
}

// in
if ("name" in obj) {
    // obj 有 name 属性
}

// 自定义类型守卫
interface Fish { swim(): void; }
interface Bird { fly(): void; }

function isFish(animal: Fish | Bird): animal is Fish {
    return (animal as Fish).swim !== undefined;
}

if (isFish(animal)) {
    animal.swim(); // Fish
}
```

---

## 六、tsconfig.json

```json
{
    "compilerOptions": {
        "target": "ES2022",
        "module": "ESNext",
        "moduleResolution": "bundler",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true,
        "isolatedModules": true,
        "noEmit": true,
        "lib": ["ES2022", "DOM", "DOM.Iterable"],
        "paths": {
            "@/*": ["./src/*"]
        }
    },
    "include": ["src"],
    "exclude": ["node_modules"]
}
```

| 选项 | 说明 |
|------|------|
| strict | 启用所有严格检查 |
| noImplicitAny | 禁止隐式 any |
| strictNullChecks | null/undefined 检查 |
| target | 编译目标 ES 版本 |
| module | 模块系统 |
| paths | 路径别名 |
