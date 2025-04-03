
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BotMeeting from "./pages/BotMeeting";
import AccountInfo from "./pages/AccountInfo";
import Permissions from "./pages/Permissions";
import Pricing from "./pages/Pricing";
import GoogleAuthCallback from "./components/auth/GoogleAuthCallback";
import { AuthProvider, useAuth } from './context/AuthContext';
import { SplashCursor } from "./components/ui/splash-cursor";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public only route (for login/signup when already authenticated)
const PublicOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="h-screen flex justify-center items-center">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
      <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/auth/callback" element={<GoogleAuthCallback />} />
      <Route path="/account-info" element={<ProtectedRoute><AccountInfo /></ProtectedRoute>} />
      <Route path="/permissions" element={<ProtectedRoute><Permissions /></ProtectedRoute>} />
      <Route path="/app" element={<ProtectedRoute><BotMeeting /></ProtectedRoute>} />
      
      {/* Redirect from /meeting/new to /app */}
      <Route path="/meeting/new" element={<Navigate to="/app" replace />} />
      <Route path="/meeting/bot" element={<Navigate to="/app" replace />} />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SplashCursor 
            COLOR_UPDATE_SPEED={5}
            DENSITY_DISSIPATION={2.5}
            VELOCITY_DISSIPATION={1.5}
            SPLAT_RADIUS={0.3}
            SPLAT_FORCE={8000}
            CURL={25}
            TRANSPARENT={true}
          />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
