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
import NetworkConnectingScreen from "./components/NetworkConnectingScreen";
import { extractCaptivePortalContext, saveCaptivePortalContext } from "@/lib/captivePortal";


function getLoginPathWithSearch() {
  return window.location.search ? `/login${window.location.search}` : "/login";
}

function persistCaptiveContextFromCurrentUrl() {

  const captiveContext = extractCaptivePortalContext(window.location.search);
   
  if (captiveContext) {
    saveCaptivePortalContext(captiveContext);
  }
}

// Component to handle captive portal URL parameters
function CaptivePortalHandler() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      persistCaptiveContextFromCurrentUrl();
      setTimeout(() => setLocation(getLoginPathWithSearch()), 50);
    } catch {
      setTimeout(() => setLocation("/login"), 50);
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
    return <Redirect to={getLoginPathWithSearch()} />;
  }

  return <Component />;
}

function Router() {
  persistCaptiveContextFromCurrentUrl();

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/auth/success" component={OAuthSuccess} />
      <Route path="/network-connecting">
        {() => <NetworkConnectingScreen onComplete={() => window.location.assign('/session')} />}
      </Route>
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
        <Redirect to={isAuthenticated() ? "/session" : getLoginPathWithSearch()} />
      </Route>
    </Switch>
  );
}

function App() {
  useEffect(() => {
    persistCaptiveContextFromCurrentUrl();
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <Router />
    </TooltipProvider>
  );
}

export default App;
