# Vue 3 教程

---

## 一、创建项目

```bash
npm create vite@latest my-app -- --template vue-ts
cd my-app
npm install
npm run dev
```

---

## 二、组合式 API

### 2.1 setup 与 ref/reactive

```vue
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

const count = ref(0)
const user = reactive({ name: 'Alice', age: 25 })

const doubleCount = computed(() => count.value * 2)

function increment() {
    count.value++
}
</script>

<template>
    <p>{{ count }} × 2 = {{ doubleCount }}</p>
    <p>{{ user.name }}, {{ user.age }}岁</p>
    <button @click="increment">+1</button>
</template>
```

### 2.2 生命周期

```vue
<script setup lang="ts">
import { onMounted, onUnmounted, onUpdated } from 'vue'

onMounted(() => {
    console.log('组件挂载')
    fetchUsers()
})

onUpdated(() => {
    console.log('组件更新')
})

onUnmounted(() => {
    console.log('组件卸载')
    clearInterval(timer)
})
</script>
```

### 2.3 watch / watchEffect

```vue
<script setup lang="ts">
import { ref, watch, watchEffect } from 'vue'

const keyword = ref('')

// watch: 精确监听
watch(keyword, (newVal, oldVal) => {
    console.log(`搜索: ${oldVal} → ${newVal}`)
    search(newVal)
}, { immediate: true, deep: true })

// watchEffect: 自动追踪依赖
watchEffect(() => {
    console.log(`当前关键词: ${keyword.value}`)
})
</script>
```

---

## 三、组件

### 3.1 Props

```vue
<!-- UserCard.vue -->
<script setup lang="ts">
interface Props {
    name: string
    age?: number
    active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    age: 0,
    active: true,
})
</script>

<template>
    <div class="card" :class="{ active }">
        <h3>{{ name }}</h3>
        <p>{{ age }}岁</p>
    </div>
</template>
```

### 3.2 Emits

```vue
<script setup lang="ts">
const emit = defineEmits<{
    (e: 'update', id: number): void
    (e: 'delete', id: number): void
}>()

function handleUpdate() {
    emit('update', props.id)
}
</script>
```

### 3.3 插槽

```vue
<!-- Card.vue -->
<template>
    <div class="card">
        <div class="card-header">
            <slot name="header">默认标题</slot>
        </div>
        <div class="card-body">
            <slot></slot>
        </div>
        <div class="card-footer">
            <slot name="footer"></slot>
        </div>
    </div>
</template>

<!-- 使用 -->
<Card>
    <template #header>用户信息</template>
    <p>内容区域</p>
    <template #footer>
        <button>确定</button>
    </template>
</Card>
```

---

## 四、路由 (Vue Router)

### 4.1 配置

```typescript
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    { path: '/', component: () => import('@/views/Home.vue') },
    { path: '/users', component: () => import('@/views/Users.vue') },
    { path: '/users/:id', component: () => import('@/views/UserDetail.vue'), props: true },
    {
        path: '/admin',
        component: () => import('@/layouts/AdminLayout.vue'),
        meta: { requiresAuth: true },
        children: [
            { path: 'dashboard', component: () => import('@/views/Dashboard.vue') },
            { path: 'settings', component: () => import('@/views/Settings.vue') },
        ],
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

router.beforeEach((to, from) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        return '/login'
    }
})

export default router
```

### 4.2 使用

```vue
<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const userId = route.params.id

function goToUser(id: number) {
    router.push(`/users/${id}`)
}
</script>
```

---

## 五、状态管理 (Pinia)

### 5.1 Store

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    const users = ref<User[]>([])
    const loading = ref(false)

    const activeUsers = computed(() => users.value.filter(u => u.active))

    async function fetchUsers() {
        loading.value = true
        try {
            const res = await api.getUsers()
            users.value = res.data
        } finally {
            loading.value = false
        }
    }

    function removeUser(id: number) {
        users.value = users.value.filter(u => u.id !== id)
    }

    return { users, loading, activeUsers, fetchUsers, removeUser }
})
```

### 5.2 使用

```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()

onMounted(() => {
    userStore.fetchUsers()
})
</script>

<template>
    <div v-if="userStore.loading">加载中...</div>
    <ul v-else>
        <li v-for="user in userStore.activeUsers" :key="user.id">
            {{ user.name }}
        </li>
    </ul>
</template>
```

---

## 六、组合式函数 (Composables)

```typescript
export function useFetch<T>(url: string) {
    const data = ref<T | null>(null)
    const error = ref<string | null>(null)
    const loading = ref(false)

    async function execute() {
        loading.value = true
        error.value = null
        try {
            const res = await fetch(url)
            data.value = await res.json()
        } catch (e) {
            error.value = (e as Error).message
        } finally {
            loading.value = false
        }
    }

    onMounted(execute)

    return { data, error, loading, refresh: execute }
}
```

```vue
<script setup lang="ts">
const { data: users, loading, error, refresh } = useFetch<User[]>('/api/users')
</script>
```

---

## 七、常见指令

```vue
<template>
    <!-- 条件渲染 -->
    <div v-if="type === 'A'">类型 A</div>
    <div v-else-if="type === 'B'">类型 B</div>
    <div v-else>其他</div>

    <!-- 列表渲染 -->
    <li v-for="item in items" :key="item.id">
        {{ item.name }}
    </li>

    <!-- 双向绑定 -->
    <input v-model="keyword" placeholder="搜索" />
    <select v-model="selected">
        <option value="a">A</option>
        <option value="b">B</option>
    </select>

    <!-- 事件修饰符 -->
    <form @submit.prevent="handleSubmit">
        <button @click.stop="handleClick">点击</button>
    </form>

    <!-- 样式绑定 -->
    <div :class="{ active: isActive, disabled: !isActive }">
    <div :style="{ color: textColor, fontSize: size + 'px' }">
</template>
```
