# 🔧 FIX: API calls returning 307 redirect in Docker production mode

## 🔍 Vấn đề

Khi chạy Docker production, mọi API call đều bị redirect 307:
- Request: `POST http://localhost:3000/api/v1/auth/login`
- Response: `307 Temporary Redirect` → `/login?returnUrl=...`
- Console log: `🔧 API_BASE_URL: /api/v1` (thiếu domain backend)

**Nguyên nhân**: Biến `NEXT_PUBLIC_API_BASE_URL` không được build vào bundle vì Next.js embed biến này tại **build time**, không phải runtime.

## ✅ Giải pháp

### Cách 1: Rebuild Docker image với biến môi trường (Recommended)

**Đã sửa:**
1. ✅ `Dockerfile` - thêm `ARG` và `ENV` trong build stage
2. ✅ `docker-compose.yml` - pass `build.args`
3. ✅ `.env.production` - đảm bảo URL đúng
4. ✅ `docker-build.sh` - script build tự động

**Chạy lại:**

```bash
# Option A: Dùng script (recommended)
./docker-build.sh
docker-compose up -d

# Option B: Manual
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**Xác minh:**

```bash
# 1. Check logs
docker-compose logs -f user-app

# 2. Vào trang login, mở Console (F12)
# Phải thấy:
🔧 API_BASE_URL: https://nascar-thehun-lived-wrote.trycloudflare.com/api/v1
🔧 NEXT_PUBLIC_API_BASE_URL: https://nascar-thehun-lived-wrote.trycloudflare.com/api/v1

# 3. Login thử, check Network tab
# Request URL phải là:
POST https://nascar-thehun-lived-wrote.trycloudflare.com/api/v1/auth/login
# KHÔNG phải:
POST http://localhost:3000/api/v1/auth/login
```

---

### Cách 2: Hardcode trong code (Quick fix cho test)

Nếu cần test nhanh không muốn rebuild:

**File: `src/config/api.ts`**
```typescript
// TEMPORARY FIX - XÓA SAU KHI TEST XONG
export const API_BASE_URL = 'https://nascar-thehun-lived-wrote.trycloudflare.com/api/v1';

// Bình thường (restore lại sau khi test):
// export const API_BASE_URL = normalizeBaseUrl(
//   process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1'
// );
```

Sau đó:
```bash
npm run build
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### Vẫn thấy `/api/v1` trong console?

**Kiểm tra:**
```bash
# 1. Xem biến trong container
docker exec hcmus-user-app env | grep NEXT_PUBLIC

# 2. Nếu rỗng → biến không được pass vào build
# Giải pháp: Thêm vào .env.production và rebuild

# 3. Clear Docker build cache
docker builder prune -a
./docker-build.sh
```

### Request vẫn bị 307 redirect?

**Kiểm tra middleware:**
```bash
# File: src/middleware.ts
# Đảm bảo PUBLIC_PATHS có "/api/"
const PUBLIC_PATHS = ["/login", "/auth/success", "/api/"];
```

**Kiểm tra axios baseURL:**
```javascript
// Mở console trên browser
console.log(axios.defaults.baseURL);
// Phải thấy: https://nascar-thehun-lived-wrote.trycloudflare.com/api/v1
// KHÔNG phải: /api/v1
```

### CORS errors?

Nếu gọi được API nhưng bị CORS:
```bash
# Backend cần allow origin
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

---

## 📋 Checklist

- [ ] Rebuild Docker image với `./docker-build.sh`
- [ ] Start container: `docker-compose up -d`
- [ ] Mở browser → `http://localhost:3000/login`
- [ ] Console log hiển thị URL đúng (Cloudflare tunnel)
- [ ] Login thành công, không bị 307 redirect
- [ ] Network tab hiển thị request đến Cloudflare, không phải localhost

---

## 💡 Giải thích kỹ thuật

### Tại sao phải build lại?

Next.js sử dụng **webpack** để bundle code. Biến `process.env.NEXT_PUBLIC_*` được **thay thế trực tiếp** vào code JavaScript tại build time:

**Code gốc:**
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api/v1';
```

**Sau khi build (nếu có biến):**
```javascript
const API_BASE_URL = "https://nascar-thehun-lived-wrote.trycloudflare.com/api/v1";
```

**Sau khi build (nếu KHÔNG có biến):**
```javascript
const API_BASE_URL = undefined || '/api/v1'; // → '/api/v1'
```

Vì thế, file `.env.production` phải có **TRƯỚC** khi build, hoặc pass qua `ARG` trong Dockerfile.

### Tại sao cần ARG trong Dockerfile?

Docker build stages không tự động load file `.env*`. Phải:
1. Dùng `ARG` để nhận giá trị từ `docker-compose build --build-arg`
2. Set `ENV` để expose cho build command
3. Next.js sẽ đọc `ENV` và embed vào bundle

---

**Tóm tắt**: Đã sửa Dockerfile + docker-compose.yml + tạo script build. Chạy `./docker-build.sh` để rebuild là xong!
