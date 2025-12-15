import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import AccessPoints from "./pages/AccessPoints";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

// Check if user is logged in
function isAuthenticated() {
  return localStorage.getItem('isLoggedIn') === 'true';
}

// Protected Route wrapper
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/login" />;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route>
        {isAuthenticated() ? (
          <DashboardLayout>
            <Switch>
              <Route path={"/"} component={Dashboard} />
              <Route path={"/users"} component={Users} />
              <Route path={"/access-points"} component={AccessPoints} />
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
