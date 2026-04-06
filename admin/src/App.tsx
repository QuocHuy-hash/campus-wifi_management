import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Redirect } from "wouter";
import { useSelector } from "react-redux";
import { RootState } from "@/stores/store";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AccessPoints from "./pages/AccessPoints";
import Policies from "./pages/Policies";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

function Router() {
  const [location] = useLocation();
  const authenticated = useSelector((state: RootState) => state.auth.isLoggedIn);
  
  if (location === '/login' && authenticated) {
    return <Redirect to="/" />;
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        {authenticated ? (
          <DashboardLayout>
            <Switch>
              <Route path={"/"} component={Dashboard} />
              <Route path={"/users"} component={Users} />
              <Route path={"/access-points"} component={AccessPoints} />
              <Route path={"/policies"} component={Policies} />
              <Route path={"/reports"} component={Reports} />
              <Route path={"/settings"} component={Settings} />
            </Switch>
          </DashboardLayout>
        ) : (
          <Redirect to="/login" />
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
