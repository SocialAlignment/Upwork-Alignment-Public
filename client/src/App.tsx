import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProjectIdea from "@/pages/project-idea";
import ProjectCreation from "@/pages/project-creation";
import Pricing from "@/pages/pricing";
import Gallery from "@/pages/gallery";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/project-idea" component={ProjectIdea} />
      <Route path="/project-creation" component={ProjectCreation} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/gallery" component={Gallery} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
