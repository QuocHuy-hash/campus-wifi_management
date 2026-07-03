"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CaptivePortalHandler() {
  const router = useRouter();

  useEffect(() => {
    const search = window.location.search;
    router.replace(`/login${search}`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-sm text-gray-600">Đang chuyển hướng tới trang đăng nhập...</div>
    </div>
  );
}
