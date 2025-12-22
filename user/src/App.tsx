import { Route, Switch, useLocation, Redirect } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "./pages/Login";
import Session from "./pages/Session";
import History from "./pages/History";
import Account from "./pages/Account";

function isAuthenticated() {
  return localStorage.getItem('portalLoggedIn') === 'true';
}

function Router() {
  const [location] = useLocation();
  const authenticated = isAuthenticated();
  
  // Redirect to session page if already logged in
  if (location === '/') {
    return <Redirect to="/session" />;
  }
  
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/session">
        {authenticated ? <Session /> : <Redirect to="/" />}
      </Route>
      <Route path="/history">
        {authenticated ? <History /> : <Redirect to="/" />}
      </Route>
      <Route path="/account">
        {authenticated ? <Account /> : <Redirect to="/" />}
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
