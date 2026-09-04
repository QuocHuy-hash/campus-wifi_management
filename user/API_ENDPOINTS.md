# Danh sách API endpoints

Tài liệu này liệt kê toàn bộ các API endpoint đang được sử dụng trong source code.

## Backend APIs (prefix `/api/v1`)

### Auth (`/api/v1/auth/...`)

| Phương thức | Endpoint |
|-------------|----------|
| POST | `/api/v1/auth/init-session` |
| POST | `/api/v1/auth/login` |
| POST | `/api/v1/auth/register` |
| POST | `/api/v1/auth/verify-otp` |
| POST | `/api/v1/auth/resend-otp` |
| GET | `/api/v1/auth/me` |
| PUT | `/api/v1/auth/me` |
| POST | `/api/v1/auth/logout` |
| POST | `/api/v1/auth/refresh-token` |
| POST | `/api/v1/auth/forgot-password` |
| POST | `/api/v1/auth/verify-reset-otp` |
| POST | `/api/v1/auth/reset-password` |
| POST | `/api/v1/auth/change-password` |

### OAuth2

| Phương thức | Endpoint |
|-------------|----------|
| GET | `/api/v1/oauth2/authorize/{provider}` |

### Users

| Phương thức | Endpoint |
|-------------|----------|
| PUT | `/api/v1/users/authorize-device` |
| GET | `/api/v1/users/devices` |

### User Sessions

| Phương thức | Endpoint |
|-------------|----------|
| GET | `/api/v1/user-sessions/me` |
| GET | `/api/v1/user-sessions/me/current` |
| POST | `/api/v1/user-sessions/me/logout` |
| POST | `/api/v1/user-sessions/me/logout-all` |
| GET | `/api/v1/user-sessions/me/usage` |

## Next.js Internal APIs

| Phương thức | Endpoint |
|-------------|----------|
| POST | `/api/auth/session` |
| POST | `/api/auth/logout` |
