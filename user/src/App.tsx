import { Route, Switch, Redirect, useLocation } from "wouter";
import type { ComponentType } from "react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Session from "./pages/Session";
import History from "./pages/History";
import Account from "./pages/Account";
import ModalShowcase from "./pages/ModalShowcase";
import Login from "./pages/Login";
import OAuthSuccess from "./pages/OAuthSuccess";
import { STORAGE_KEYS } from "@/constants/appKeys";
import type { CaptivePortalContext } from "@/features/auth/types";

// Component to handle captive portal URL parameters
function CaptivePortalHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Extract URL parameters from the captive portal redirect
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id')?.trim() || '';
    const ap = params.get('ap')?.trim() || '';
    const ssid = params.get('ssid')?.trim() || '';
    const url = params.get('url')?.trim() || '';
    const t = params.get('t')?.trim() || '';
    try {
      // Log params for debugging
      // eslint-disable-next-line no-console
      console.log('Captive portal params:', { id, ap, ssid, url, t });

      // Store captive context in localStorage so the redirect flow can resume reliably
      if (id && ap && ssid && url) {
        localStorage.setItem(
          STORAGE_KEYS.portalCaptiveContext,
          JSON.stringify({ id, ap, ssid, url, t } as CaptivePortalContext & { t?: string }),
        );
      }

      // Small delay so the UI can render (avoids completely blank page in some environments)
      // then redirect to login page with query params preserved
      setTimeout(() => setLocation(`/login${window.location.search}`), 50);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error handling captive portal params', err);
    }
  }, [setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center text-sm text-gray-600">Đang chuyển hướng tới trang đăng nhập…</div>
    </div>
  );
}

function isAuthenticated() {
  return localStorage.getItem("portalLoggedIn") === "true";
}

function ProtectedRoute({ component: Component }: { component: ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/success" component={OAuthSuccess} />
      {/* Handle captive portal URLs like /guest/s/default/ */}
      <Route path="/guest*">
        <CaptivePortalHandler />
      </Route>
      <Route path="/session">
        <ProtectedRoute component={Session} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={History} />
      </Route>
      <Route path="/account">
        <ProtectedRoute component={Account} />
      </Route>
      <Route path="/modal-showcase" component={ModalShowcase} />
      <Route path="*">
        <Redirect to={isAuthenticated() ? "/session" : "/login"} />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
