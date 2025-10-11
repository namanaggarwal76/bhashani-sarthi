import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { UserProvider } from "@/context/UserContext";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Translate from "@/pages/Translate";
import Speech from "@/pages/Speech";
import OCR from "@/pages/OCR";
import Guide from "@/pages/Guide";

const queryClient = new QueryClient();

function RootRoutes() {
  const hasUser = !!localStorage.getItem("sarthi.user");
  return (
    <Routes>
      <Route path="/" element={<Navigate to={hasUser ? "/home" : "/onboarding"} replace />} />
      <Route path="/onboarding" element={<Onboarding />} />
      <Route path="/home" element={<Home />} />
      <Route path="/translate" element={<Translate />} />
      <Route path="/speech" element={<Speech />} />
      <Route path="/ocr" element={<OCR />} />
      <Route path="/guide" element={<Guide />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <UserProvider>
        <BrowserRouter>
          <RootRoutes />
        </BrowserRouter>
      </UserProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
