"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("portalLoggedIn") === "true";
    if (isLoggedIn) {
      router.replace("/session");
    } else {
      const search = window.location.search;
      router.replace(`/login${search}`);
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-sm text-gray-600">Đang chuyển hướng...</div>
    </div>
  );
}
