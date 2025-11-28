import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Analysis from "@/pages/Analysis";
import Templates from "@/pages/Templates";
import NotFound from "@/pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/chat" component={Chat} />
      <Route path="/analysis" component={Analysis} />
      <Route path="/templates" component={Templates} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
