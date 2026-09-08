import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  output: "standalone",
  outputFileTracingRoot: __dirname,
  async rewrites() {
    // API base dùng cho các endpoint nằm dưới /api/v1 (VD: http://localhost:3030/api/v1).
    const apiBase =
      process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3030/api/v1";
    // Sửa ngày 2026-09-07: local wifi-user dùng /v1, còn gateway dùng /api/v1.
    // Bỏ cả hai dạng prefix để OAuth2 luôn đi đến root của backend.
    const backendBase = apiBase.replace(/\/(?:api\/)?v1\/?$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiBase}/:path*`,
      },
      // Spring Security OAuth2 sử dụng các path root này khi redirect.
      // Cần đảm bảo gateway/ingress production cũng route /oauth2/** và /login/oauth2/** về backend.
      {
        source: "/oauth2/:path*",
        destination: `${backendBase}/oauth2/:path*`,
      },
      {
        source: "/login/oauth2/:path*",
        destination: `${backendBase}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;
