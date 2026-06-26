import type { Metadata, Viewport } from "next";
import Providers from "./providers";
import "@/index.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "HCMUS WiFi Portal",
  description: "HCMUS WiFi Portal - Quản lý phiên đăng nhập và lịch sử sử dụng WiFi",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
