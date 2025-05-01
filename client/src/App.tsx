import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/layout/header";
import MobileNav from "@/components/layout/mobile-nav";
import Footer from "@/components/layout/footer";
import Dashboard from "@/pages/dashboard";
import Habits from "@/pages/habits";
import Analytics from "@/pages/analytics";
import Settings from "@/pages/settings";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/habits" component={Habits} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 mb-20 md:mb-6 flex-grow">
          <Router />
        </main>
        <MobileNav />
        <Footer />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
