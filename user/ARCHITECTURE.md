# ARCHITECTURE.md - Kien truc du an

> HCMUS WiFi Management - User Portal
> React 19 · TypeScript · Vite · Redux Toolkit · TailwindCSS v4

## Cau truc thu muc

```text
user/
|- src/
|  |- App.tsx                      # Router root + auth guard
|  |- main.tsx                     # Bootstrap: Redux Provider -> App
|  |- index.css                    # Global styles
|  |
|  |- components/                  # Shared UI (ui primitives + reusable widgets)
|  |- config/
|  |  |- api.ts                    # API_BASE_URL
|  |  |- axios.ts                  # Axios instance + auth interceptor
|  |
|  |- constants/
|  |  |- appKeys.ts                # STORAGE_KEYS, HTTP_CONFIG
|  |
|  |- data/                        # Mock data fallback
|  |
|  |- features/
|  |  |- auth/
|  |  |  |- index.tsx              # Feature root
|  |  |  |- api/
|  |  |  |  |- authApi.ts          # OAuth2, register, verify, resend OTP
|  |  |  |- slices/
|  |  |  |  |- authSlice.ts        # Redux state + async thunks
|  |  |  |- components/
|  |  |  |  |- AuthFeature.tsx     # Login/register/OTP UI + integration logic
|  |  |  |- types/
|  |  |     |- index.ts            # Auth interfaces
|  |  |
|  |  |- session/
|  |  |  |- index.tsx
|  |  |- history/
|  |  |  |- index.tsx
|  |  |- account/
|  |     |- index.tsx
|  |
|  |- pages/                       # Route wrappers (chi render feature)
|  |  |- Login.tsx
|  |  |- Session.tsx
|  |  |- History.tsx
|  |  |- Account.tsx
|  |  |- ModalShowcase.tsx
|  |
|  |- stores/
|     |- store.ts                  # Root Redux store
|     |- hooks.ts                  # useAppDispatch/useAppSelector
|- package.json
|- vite.config.ts
|- tsconfig.json
```

## Nguyen tac Feature

Moi feature co cau truc:

```text
features/<feature>/
|- index.tsx
|- api/
|- slices/
|- components/
|- types/
```

## Redux Store hien tai

```text
store.ts
|- auth -> features/auth/slices/authSlice.ts
```

## Route Map hien tai

| Path | Page Wrapper | Feature |
|---|---|---|
| /login | pages/Login.tsx | auth |
| /session | pages/Session.tsx | session |
| /history | pages/History.tsx | history |
| /account | pages/Account.tsx | account |

## Tich hop API Auth (V2)

Da tich hop:
- GET /api/v1/providers-config?isActive=true
- Browser redirect OAuth2: /api/v1/auth/oauth2/authorize/{provider}
- POST /api/v1/auth/register
- POST /api/v1/auth/verify-email
- POST /api/v1/auth/resend-otp

Luu y:
- OAuth2 `authorize` su dung `window.location.href`, khong dung fetch/axios.
- Phone/Zalo flow hien van giu mock de cho backend endpoint tuong ung.
