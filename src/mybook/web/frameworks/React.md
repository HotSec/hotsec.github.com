# React 教程

## 项目创建

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
npm run dev
```

## JSX 与组件

### 函数组件

```tsx
interface GreetingProps {
    name: string;
    age?: number;
}

function Greeting({name, age = 0}: GreetingProps) {
    return (
        <div>
            <h1>Hello, {name}!</h1>
            {age > 0 && <p>Age: {age}</p>}
        </div>
    );
}

function App() {
    return (
        <div>
            <Greeting name="Alice" age={30} />
            <Greeting name="Bob" />
        </div>
    );
}
```

### 条件渲染

```tsx
function Status({isLoading, error, data}: {
    isLoading: boolean;
    error: string | null;
    data: User | null;
}) {
    if (isLoading) return <Spinner />;
    if (error) return <ErrorMessage message={error} />;
    if (!data) return <EmptyState />;

    return <UserCard user={data} />;
}
```

### 列表渲染

```tsx
interface Item {
    id: string;
    name: string;
    price: number;
}

function ItemList({items}: {items: Item[]}) {
    return (
        <ul>
            {items.map((item) => (
                <li key={item.id}>
                    <span>{item.name}</span>
                    <span>${item.price}</span>
                </li>
            ))}
        </ul>
    );
}
```

***

## Hooks

### useState

```tsx
function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(c => c + 1)}>+1</button>
            <button onClick={() => setCount(c => c - 1)}>-1</button>
            <button onClick={() => setCount(0)}>Reset</button>
        </div>
    );
}

function Form() {
    const [form, setForm] = useState({name: '', email: ''});

    const update = (field: string, value: string) => {
        setForm(prev => ({...prev, [field]: value}));
    };

    return (
        <form>
            <input
                value={form.name}
                onChange={e => update('name', e.target.value)}
                placeholder="Name"
            />
            <input
                value={form.email}
                onChange={e => update('email', e.target.value)}
                placeholder="Email"
            />
        </form>
    );
}
```

### useEffect

```tsx
function UserProfile({userId}: {userId: string}) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        async function fetchUser() {
            setLoading(true);
            const data = await api.getUser(userId);
            if (!cancelled) {
                setUser(data);
                setLoading(false);
            }
        }

        fetchUser();

        return () => {
            cancelled = true;
        };
    }, [userId]);

    if (loading) return <Spinner />;
    if (!user) return null;
    return <UserCard user={user} />;
}

function WindowSize() {
    const [size, setSize] = useState({width: window.innerWidth, height: window.innerHeight});

    useEffect(() => {
        const handleResize = () => {
            setSize({width: window.innerWidth, height: window.innerHeight});
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return <p>{size.width} x {size.height}</p>;
}
```

### useRef

```tsx
function TextInputWithFocus() {
    const inputRef = useRef<HTMLInputElement>(null);

    const focusInput = () => {
        inputRef.current?.focus();
    };

    return (
        <div>
            <input ref={inputRef} type="text" />
            <button onClick={focusInput}>Focus</button>
        </div>
    );
}

function Stopwatch() {
    const [time, setTime] = useState(0);
    const intervalRef = useRef<number | null>(null);

    const start = () => {
        if (intervalRef.current) return;
        intervalRef.current = window.setInterval(() => {
            setTime(t => t + 10);
        }, 10);
    };

    const stop = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const reset = () => {
        stop();
        setTime(0);
    };

    return (
        <div>
            <span>{(time / 1000).toFixed(2)}s</span>
            <button onClick={start}>Start</button>
            <button onClick={stop}>Stop</button>
            <button onClick={reset}>Reset</button>
        </div>
    );
}
```

### useMemo / useCallback

```tsx
function ExpensiveList({items, filter}: {items: Item[]; filter: string}) {
    const filtered = useMemo(() => {
        return items.filter(item =>
            item.name.toLowerCase().includes(filter.toLowerCase())
        );
    }, [items, filter]);

    const total = useMemo(() => {
        return filtered.reduce((sum, item) => sum + item.price, 0);
    }, [filtered]);

    return (
        <div>
            <p>Total: ${total}</p>
            {filtered.map(item => (
                <ItemRow key={item.id} item={item} />
            ))}
        </div>
    );
}

function Parent() {
    const [count, setCount] = useState(0);
    const [text, setText] = useState('');

    const handleClick = useCallback(() => {
        setCount(c => c + 1);
    }, []);

    return (
        <div>
            <input value={text} onChange={e => setText(e.target.value)} />
            <Child onClick={handleClick} count={count} />
        </div>
    );
}

const Child = memo(function Child({onClick, count}: {onClick: () => void; count: number}) {
    return <button onClick={onClick}>Count: {count}</button>;
});
```

### useReducer

```tsx
interface State {
    items: CartItem[];
    total: number;
}

type Action =
    | {type: 'ADD'; payload: CartItem}
    | {type: 'REMOVE'; payload: string}
    | {type: 'UPDATE_QTY'; payload: {id: string; qty: number}}
    | {type: 'CLEAR'};

function cartReducer(state: State, action: Action): State {
    switch (action.type) {
        case 'ADD': {
            const existing = state.items.find(i => i.id === action.payload.id);
            if (existing) {
                return {
                    items: state.items.map(i =>
                        i.id === action.payload.id
                            ? {...i, quantity: i.quantity + 1}
                            : i
                    ),
                    total: state.total + action.payload.price,
                };
            }
            return {
                items: [...state.items, {...action.payload, quantity: 1}],
                total: state.total + action.payload.price,
            };
        }
        case 'REMOVE': {
            const item = state.items.find(i => i.id === action.payload);
            return {
                items: state.items.filter(i => i.id !== action.payload),
                total: state.total - (item ? item.price * item.quantity : 0),
            };
        }
        case 'UPDATE_QTY': {
            return {
                items: state.items.map(i =>
                    i.id === action.payload.id
                        ? {...i, quantity: action.payload.qty}
                        : i
                ),
                total: state.items.reduce(
                    (sum, i) =>
                        sum + i.price * (i.id === action.payload.id ? action.payload.qty : i.quantity),
                    0
                ),
            };
        }
        case 'CLEAR':
            return {items: [], total: 0};
    }
}

function ShoppingCart() {
    const [state, dispatch] = useReducer(cartReducer, {items: [], total: 0});

    return (
        <div>
            {state.items.map(item => (
                <div key={item.id}>
                    <span>{item.name} x {item.quantity}</span>
                    <button onClick={() => dispatch({type: 'REMOVE', payload: item.id})}>
                        Remove
                    </button>
                </div>
            ))}
            <p>Total: ${state.total}</p>
        </div>
    );
}
```

***

## 自定义 Hook

```tsx
function useLocalStorage<T>(key: string, initialValue: T) {
    const [value, setValue] = useState<T>(() => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : initialValue;
    });

    useEffect(() => {
        localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue] as const;
}

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debounced;
}

function useFetch<T>(url: string) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let cancelled = false;

        fetch(url)
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                if (!cancelled) {
                    setData(data);
                    setLoading(false);
                }
            })
            .catch(err => {
                if (!cancelled) {
                    setError(err.message);
                    setLoading(false);
                }
            });

        return () => { cancelled = true; };
    }, [url]);

    return {data, error, loading};
}
```

***

## Context

```tsx
interface Theme {
    mode: 'light' | 'dark';
    toggle: () => void;
}

const ThemeContext = createContext<Theme>({
    mode: 'light',
    toggle: () => {},
});

function ThemeProvider({children}: {children: React.ReactNode}) {
    const [mode, setMode] = useState<'light' | 'dark'>('light');

    const toggle = () => setMode(m => (m === 'light' ? 'dark' : 'light'));

    return (
        <ThemeContext.Provider value={{mode, toggle}}>
            {children}
        </ThemeContext.Provider>
    );
}

function useTheme() {
    return useContext(ThemeContext);
}

function ThemedButton() {
    const {mode, toggle} = useTheme();

    return (
        <button
            onClick={toggle}
            style={{
                background: mode === 'dark' ? '#1f2937' : '#f3f4f6',
                color: mode === 'dark' ? '#f9fafb' : '#111827',
            }}
        >
            Toggle Theme ({mode})
        </button>
    );
}
```

***

## React Router

```tsx
import {BrowserRouter, Routes, Route, Link, useParams, useNavigate} from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/users">Users</Link>
            </nav>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/users/:id" element={<UserDetail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

function UserDetail() {
    const {id} = useParams<{id: string}>();
    const navigate = useNavigate();
    const {data, loading} = useFetch<User>(`/api/users/${id}`);

    if (loading) return <Spinner />;

    return (
        <div>
            <h1>{data?.name}</h1>
            <button onClick={() => navigate('/users')}>Back</button>
        </div>
    );
}
```

***

## 状态管理 (Zustand)

```tsx
import {create} from 'zustand';

interface AppState {
    user: User | null;
    token: string | null;
    login: (user: User, token: string) => void;
    logout: () => void;
}

const useStore = create<AppState>((set) => ({
    user: null,
    token: null,
    login: (user, token) => set({user, token}),
    logout: () => set({user: null, token: null}),
}));

function LoginButton() {
    const {user, login, logout} = useStore();

    if (user) {
        return <button onClick={logout}>Logout ({user.name})</button>;
    }

    const handleLogin = async () => {
        const res = await api.login({username: 'alice', password: 'secret'});
        login(res.user, res.token);
    };

    return <button onClick={handleLogin}>Login</button>;
}
```
