"use client";

import NetworkConnectingScreen from "@/components/NetworkConnectingScreen";
import { useRouter } from "next/navigation";

export default function NetworkConnectingPage() {
  const router = useRouter();
  return <NetworkConnectingScreen onComplete={() => {
    sessionStorage.setItem('pendingCaptiveRedirect', 'true');
    router.replace("/session");
  }} />;
}
