import { Route, Switch, Redirect } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Session from "./pages/Session";
import History from "./pages/History";
import Account from "./pages/Account";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Redirect to="/session" />
      </Route>
      <Route path="/session" component={Session} />
      <Route path="/history" component={History} />
      <Route path="/account" component={Account} />
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
