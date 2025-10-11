import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";

// --- Page Imports ---
import NotFound from "./pages/NotFound";
import Home from "@/pages/Home";
import Onboarding from "@/pages/Onboarding";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Translate from "@/pages/Translate";
import Speech from "@/pages/Speech";
import OCR from "@/pages/OCR";
import Guide from "@/pages/Guide";

// --- Context & Lib Imports ---
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UserProvider, useUser } from "@/context/UserContext";
import { initializeFirebase } from "@/lib/firebase";
import Background from "@/components/Background";

// Initialize Firebase
initializeFirebase();

const queryClient = new QueryClient();

/**
 * A layout component that protects routes requiring authentication.
 * It checks for the user's auth state and redirects if they are not logged in.
 */
function ProtectedRoute() {
  const { currentUser, loading: authLoading } = useAuth();
  const { user, loading: userLoading } = useUser();

    if (authLoading || userLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        {/* You can replace this with a beautiful spinner component */}
        <div className="text-lg font-semibold text-gray-900">Loading Sarthi...</div>
      </div>
    );
  }

  // If auth is loaded and there's no logged-in user, redirect to login.
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // If the user is logged in but hasn't completed onboarding, redirect them.
  if (currentUser && !user) {
    return <Navigate to="/onboarding" replace />;
  }
  
  // If authenticated and onboarded, render the child route.
  return <Outlet />;
}

/**
 * A layout component for routes that should only be accessible to logged-out users.
 * E.g., a logged-in user shouldn't see the login page again.
 */
function PublicRoute() {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
    }

    // If the user is logged in, redirect them away from public pages like login/signup.
    return currentUser ? <Navigate to="/home" replace /> : <Outlet />;
}


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
  <Background />
  <div className="app-content relative z-10 pt-6">
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <AuthProvider>
          <UserProvider>
            <Routes>
              {/* === Public Routes === */}
              {/* These routes are for logged-out users. Logged-in users will be redirected. */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
              </Route>

              {/* === Protected Routes === */}
              {/* These routes require a user to be logged in and have a user profile. */}
              <Route element={<ProtectedRoute />}>
                <Route path="/home" element={<Home />} />
                <Route path="/translate" element={<Translate />} />
                <Route path="/speech" element={<Speech />} />
                <Route path="/ocr" element={<OCR />} />
                <Route path="/guide" element={<Guide />} />
              </Route>
              
              {/* Onboarding is a special case - needs auth but not a full user profile */}
              <Route path="/onboarding" element={<Onboarding />} />
              
              {/* Initial navigation route */}
              <Route path="/" element={<Navigate to="/home" replace />} />

              {/* Catch-all 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </UserProvider>
        </AuthProvider>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
(window as any).__reactMounted = true;
