# DFMEA Platform

> Design Failure Mode & Effects Analysis – React + TypeScript + ShadCN + TailwindCSS

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## 🔑 Demo Credentials (localhost auth)

| Role     | Email                | Password     | Access                         |
|----------|----------------------|--------------|--------------------------------|
| Viewer   | viewer@dfmea.com     | viewer123    | Viewer page only               |
| Engineer | engineer@dfmea.com   | engineer123  | Viewer + Engineer pages        |
| Admin    | admin@dfmea.com      | admin123     | All pages (Viewer/Engineer/Admin) |

---

## 🏗️ Architecture

### Tech Stack
- **React 18** + **TypeScript 5**
- **Vite 5** – build tool
- **TailwindCSS 3** – utility-first styling
- **ShadCN UI** (Radix primitives) – accessible components
- **@tanstack/react-query v5** – server state management
- **Axios** – HTTP client with interceptors
- **react-router-dom v6** – SPA routing

### Environment Variables
```env
# .env
VITE_API_URL=https://api.npoint.io/9dc78151e33b0f60fe8a
```
All API base URLs are stored in `.env` and injected via `import.meta.env.VITE_*`. Never hardcode URLs.

---

## 📁 Folder Structure

```
src/
├── components/
│   ├── ui/                     # ShadCN base components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   └── textarea.tsx
│   └── layout/                 # Shared layout components
│       ├── AppHeader.tsx        # Top nav + page header
│       ├── ProtectedRoute.tsx   # RBAC route guard
│       ├── CascadeDropdowns.tsx # 4-level cascade filter
│       ├── DfmeaTable.tsx       # FMEA data table
│       └── SuccessBanner.tsx    # Green status banner
│
├── config/
│   └── auth.ts                 # Mock users + role→route map
│
├── context/
│   ├── AuthContext.tsx          # Auth state + login/logout
│   └── ThemeContext.tsx         # Light/dark theme
│
├── hooks/
│   └── useDfmea.ts             # useQuery + useMutation hooks
│
├── lib/
│   ├── utils.ts                # cn() tailwind merge utility
│   └── mockData.ts             # Mock FMEA row generator
│
├── pages/
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── viewer/
│   │   └── ViewerPage.tsx
│   ├── engineer/
│   │   └── EngineerPage.tsx
│   └── admin/
│       └── AdminPage.tsx
│
├── services/
│   ├── apiClient.ts            # Axios instance + interceptors
│   └── dfmea.service.ts        # API service methods
│
├── types/
│   └── index.ts                # TypeScript interfaces
│
├── App.tsx                     # Route definitions
├── main.tsx                    # React root + QueryClient
└── index.css                   # Tailwind + CSS variables
```

---

## 🔐 Role-Based Access Control (RBAC)

```
Viewer   → /viewer  (read-only table, download CSV)
Engineer → /viewer + /engineer  (generate + save DFMEA)
Admin    → /viewer + /engineer + /admin  (upload + full access)
```

**`ProtectedRoute`** wraps each route and checks `user.role` against `allowedRoles[]`. If unauthorized, redirects to the user's highest permitted route.

The nav header disables tabs the current role cannot access.

---

## 🔄 Data Flow

```
API (npoint.io)
    ↓ Axios (with interceptors)
    ↓ dfmea.service.ts
    ↓ useDfmeaData() [useQuery – 5min cache]
    ↓ Component
       ↓ usePrograms()            → unique programs
       ↓ useProductCategories()   → filtered by program
       ↓ useSubsystems()          → filtered by program+category
       ↓ useProducts()            → filtered by all three
       ↓ <CascadeDropdowns>       → sequential unlock
```

**Dropdown cascade logic:**
- `program` field → **Program** dropdown
- `campaign` field → **Product Category** dropdown  
- `subsystem` field → **Subsystem(s)** dropdown
- `product` field → **Products** dropdown

Each subsequent dropdown is disabled until the previous one has a value.

---

## 🎨 Theming

Light and dark themes defined via CSS custom properties in `src/index.css`:

```css
:root { /* light theme HSL variables */ }
.dark { /* dark theme HSL variables */ }
```

Toggle persists to `localStorage` and respects `prefers-color-scheme` on first load.

---

## 🧩 Key Patterns

### useQuery Example
```ts
export function useDfmeaData() {
  return useQuery({
    queryKey: ['dfmea', 'records'],
    queryFn: dfmeaService.getAll,
    staleTime: 5 * 60 * 1000,
    select: (res) => res.data,
  })
}
```

### useMutation Example
```ts
export function useSaveDfmea() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: dfmeaService.saveDfmea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dfmea', 'records'] })
    },
  })
}
```

### Axios Interceptors
```ts
// Request: attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('dfmea_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Response: handle 401 → logout
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dfmea_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

---

## 🚀 Build for Production

```bash
npm run build
# Output: dist/
```
# dfmea
