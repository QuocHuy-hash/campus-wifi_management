import { Route, Switch, Redirect } from "wouter";
import type { ComponentType } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Session from "./pages/Session";
import History from "./pages/History";
import Account from "./pages/Account";
import ModalShowcase from "./pages/ModalShowcase";
import Login from "./pages/Login";
import OAuthSuccess from "./pages/OAuthSuccess";

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
      <Route path="/">
        <Redirect to={isAuthenticated() ? "/session" : "/login"} />
      </Route>
      <Route path="/login" component={Login} />
      <Route path="/auth/success" component={OAuthSuccess} />
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
