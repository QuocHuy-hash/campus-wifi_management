/**
 * API Configuration
 * Centralized configuration for API endpoints
 */

// Luôn gọi API qua Next.js cùng origin. next.config.ts sẽ proxy request sang
// NEXT_PUBLIC_API_BASE_URL ở backend. Cách này bảo đảm cookie refresh_token mà
// backend đặt với Path=/api/v1/auth/refresh-token được trình duyệt gửi lại đúng
// endpoint, kể cả khi URL thật phía gateway có thêm prefix /api/user.
export const API_BASE_URL = "/api/v1";
