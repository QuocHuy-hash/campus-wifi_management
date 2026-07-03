"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Fallback: if middleware didn't redirect (shouldn't happen), redirect client-side
    router.replace("/session");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-sm text-gray-600">Đang chuyển hướng...</div>
    </div>
  );
}
