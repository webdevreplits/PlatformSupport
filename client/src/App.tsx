import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppSidebar } from "@/components/AppSidebar";
import Dashboard from "@/pages/Dashboard";
import Pages from "@/pages/Pages";
import PageForm from "@/pages/PageForm";
import PageView from "@/pages/PageView";
import Incidents from "@/pages/Incidents";
import Jobs from "@/pages/Jobs";
import Tools from "@/pages/Tools";
import CostAnalysis from "@/pages/CostAnalysis";
import Resources from "@/pages/Resources";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <div className="flex-1 ml-16">
        {children}
      </div>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/">
        <ProtectedRoute>
          <ProtectedLayout>
            <Dashboard />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pages">
        <ProtectedRoute>
          <ProtectedLayout>
            <Pages />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pages/new">
        <ProtectedRoute>
          <ProtectedLayout>
            <PageForm />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pages/:id/edit">
        <ProtectedRoute>
          <ProtectedLayout>
            <PageForm />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/pages/:id/view">
        <ProtectedRoute>
          <ProtectedLayout>
            <PageView />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/incidents">
        <ProtectedRoute>
          <ProtectedLayout>
            <Incidents />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/jobs">
        <ProtectedRoute>
          <ProtectedLayout>
            <Jobs />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/cost-analysis">
        <ProtectedRoute>
          <ProtectedLayout>
            <CostAnalysis />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/resources">
        <ProtectedRoute>
          <ProtectedLayout>
            <Resources />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/tools">
        <ProtectedRoute>
          <ProtectedLayout>
            <Tools />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <ProtectedLayout>
            <Settings />
          </ProtectedLayout>
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
