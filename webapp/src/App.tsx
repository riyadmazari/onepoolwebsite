
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Toaster as ToastProvider } from "./components/ui/sonner";

import Index from "./pages/Index";
import Collector from "./pages/Collector";
import Contributor from "./pages/Contributor";
import BusinessDashboard from "./pages/BusinessDashboard";
import ConnectStripe from "./pages/ConnectStripe";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Toaster />
        <ToastProvider />
        <BrowserRouter basename="/app">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/collect/:poolId" element={<Collector />} />
            <Route path="/pay/:poolId" element={<Contributor />} />
            <Route path="/dashboard/:businessId" element={<BusinessDashboard />} />
            <Route path="/connect-stripe" element={<ConnectStripe />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
