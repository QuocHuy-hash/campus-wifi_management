"use client";

// Trang debug tạm: xem lại toàn bộ vết redirect của luồng captive trên thiết bị thật.
// Sau khi test xong, mở https://<portal>/debug-redirects bằng trình duyệt thường trên
// cùng thiết bị để đọc trail (được lưu trong localStorage nên sống qua các lần redirect).

import { useEffect, useState } from "react";
import { getRedirectTrail, clearRedirectTrail, type RedirectLogEntry } from "@/lib/redirectLog";

export default function DebugRedirectsPage() {
  const [trail, setTrail] = useState<RedirectLogEntry[]>([]);
  const [captiveContext, setCaptiveContext] = useState<string>("");
  const [handoff, setHandoff] = useState<string>("");

  const refresh = () => {
    setTrail(getRedirectTrail());
    try {
      setCaptiveContext(localStorage.getItem("portalCaptiveContext") || "(trống)");
    } catch {
      setCaptiveContext("(không đọc được)");
    }
    try {
      const mode = sessionStorage.getItem("captiveEntryMode") || "-";
      const url = sessionStorage.getItem("captiveOriginalUrl") || "-";
      setHandoff(`entryMode=${mode} | url=${url}`);
    } catch {
      setHandoff("(không đọc được)");
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="min-h-screen bg-white p-4 text-xs font-mono">
      <h1 className="text-base font-bold mb-3">🔀 Redirect Trail (debug)</h1>

      <div className="mb-3 p-2 bg-gray-100 rounded break-all">
        <p className="font-bold">portalCaptiveContext (localStorage):</p>
        <p>{captiveContext}</p>
        <p className="font-bold mt-2">handoff (sessionStorage):</p>
        <p>{handoff}</p>
      </div>

      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={refresh}
          className="px-3 py-1.5 bg-blue-600 text-white rounded"
        >
          Làm mới
        </button>
        <button
          type="button"
          onClick={() => {
            clearRedirectTrail();
            refresh();
          }}
          className="px-3 py-1.5 bg-red-600 text-white rounded"
        >
          Xoá trail
        </button>
      </div>

      {trail.length === 0 ? (
        <p className="text-gray-500">Chưa có bản ghi redirect nào.</p>
      ) : (
        <ol className="space-y-2">
          {[...trail].reverse().map((entry, i) => (
            <li key={`${entry.at}-${i}`} className="p-2 border border-gray-200 rounded break-all">
              <p className="text-gray-400">{entry.at}</p>
              <p className="font-bold text-blue-700">{entry.reason}</p>
              <p><span className="text-gray-500">from:</span> {entry.from}</p>
              <p><span className="text-gray-500">to:</span> {entry.to}</p>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
