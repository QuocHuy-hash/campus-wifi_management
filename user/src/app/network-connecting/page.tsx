"use client";

import { useRouter, useSearchParams } from "next/navigation";
import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";

export default function NetworkConnectingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAnonymousFlow = searchParams.get("flow") === "anonymous";
  const authorizationFailed = searchParams.get("authorized") === "false";
  const initiallyConnected = isAnonymousFlow && searchParams.get("network_ready") === "1";

  const handleComplete = () => {
    // Huy- Cập nhật ngày 2026-09-08: các login thường có Captive Portal chuyển sang trang thành công sau khi mạng sẵn sàng.
    router.replace("/network-success");
  };

  return (
    <NetworkConnectingScreen
      onComplete={handleComplete}
      stayOnSuccess={isAnonymousFlow}
      authorizationFailed={authorizationFailed}
      initiallyConnected={initiallyConnected}
      reloadOnSuccess={isAnonymousFlow}
    />
  );
}
