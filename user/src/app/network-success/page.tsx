"use client";

import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function NetworkSuccessPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <section className="w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-xl shadow-slate-200/70">
        <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" aria-hidden="true" />
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-900">Kết nối thành công</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          Thiết bị của bạn đã được cấp quyền và kết nối Internet đã sẵn sàng.
        </p>
        <Link
          href="/session"
          className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl bg-blue-700 text-sm font-semibold text-white transition hover:bg-blue-800"
        >
          Xem phiên kết nối
        </Link>
      </section>
    </main>
  );
}
