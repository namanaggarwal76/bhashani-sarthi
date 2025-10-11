import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { initializeFirebase } from "@/lib/firebase";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Translate from "@/pages/Translate";
import Speech from "@/pages/Speech";
import OCR from "@/pages/OCR";
import Guide from "@/pages/Guide";

// Initialize Firebase
initializeFirebase();

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useUser();
  const { currentUser } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  // Not authenticated - redirect to login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // Authenticated but no user profile - redirect to onboarding
  if (!user) {
    return <Navigate to="/onboarding" replace />;
  }
  
  return <>{children}</>;
}

function RootRoutes() {
  const { user, loading } = useUser();
  const { currentUser } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }
  
  return (
    <Routes>
      <Route
        path="/"
        element={<Navigate to={user ? "/home" : "/login"} replace />}
      />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignUp />} />
      <Route 
        path="/onboarding" 
        element={
          currentUser ? <Onboarding /> : <Navigate to="/login" replace />
        } 
      />
      <Route 
        path="/home" 
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/translate" 
        element={
          <ProtectedRoute>
            <Translate />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/speech" 
        element={
          <ProtectedRoute>
            <Speech />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ocr" 
        element={
          <ProtectedRoute>
            <OCR />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/guide" 
        element={
          <ProtectedRoute>
            <Guide />
          </ProtectedRoute>
        } 
      />
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
      <AuthProvider>
        <UserProvider>
          <BrowserRouter>
            <RootRoutes />
          </BrowserRouter>
        </UserProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
