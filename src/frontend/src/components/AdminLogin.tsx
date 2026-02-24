import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { useBackendAuthenticate } from "@/hooks/useQueries";

const ADMIN_USERNAME = "Gaurav";
const ADMIN_PASSWORD = "Gaurav_20";
const ADMIN_SESSION_KEY = "adminAuthenticated";

interface AdminLoginProps {
  onAuthenticated: () => void;
  onBack?: () => void;
}

export function AdminLogin({ onAuthenticated, onBack }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const backendAuth = useBackendAuthenticate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // First validate credentials locally
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        setError("Invalid username or password");
        setPassword("");
        setIsSubmitting(false);
        return;
      }

      // Then authenticate with backend
      await backendAuth.mutateAsync({ username, password });
      
      // Store credentials for re-authentication if needed
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem("adminUsername", username);
      localStorage.setItem("adminPassword", password);
      localStorage.setItem("userRole", "admin");
      
      onAuthenticated();
    } catch (err) {
      console.error("Backend authentication failed:", err);
      setError("Failed to authenticate with backend. Please try again.");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Live animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950" />
      
      {/* Animated pulsing radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)]">
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_30%_70%,rgba(217,70,239,0.12),transparent_60%)]" />
      </div>
      
      {/* Floating animated particles/orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-fuchsia-500/25 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-40 right-40 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl animate-float-reverse" />
      <div className="absolute bottom-40 left-40 w-56 h-56 bg-magenta-500/20 rounded-full blur-3xl animate-float" />
      
      {/* Moving diagonal lines effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-slide-down" />
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent animate-slide-down-delayed" />
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-slide-down-slow" />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-purple-950/40 backdrop-blur-xl border-2 border-purple-500/40 shadow-2xl shadow-purple-500/30 p-8 space-y-6 rounded-lg">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 -mt-2 text-purple-200 hover:text-purple-100 hover:bg-purple-800/30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          {/* Glowing shield icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500 blur-xl opacity-60 animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Shield className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
          
          {/* Heading with custom Orbitron font */}
          <div className="space-y-2 text-center">
            <h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Admin Authentication
            </h1>
            <p className="text-purple-200/80">
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-purple-200">
                <User className="h-4 w-4" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
                autoFocus
                className="w-full bg-purple-950/50 border-purple-500/40 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-400 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-purple-200">
                <Lock className="h-4 w-4" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                autoComplete="current-password"
                className="w-full bg-purple-950/50 border-purple-500/40 text-purple-100 placeholder:text-purple-400/50 focus:border-purple-400 focus:ring-purple-500/50"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-500/40 text-red-200 text-sm rounded backdrop-blur-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full bg-gradient-to-r from-purple-600 via-fuchsia-600 to-violet-600 hover:from-purple-500 hover:via-fuchsia-500 hover:to-violet-500 text-white border-0 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isSubmitting ? "Authenticating..." : "Login"}
            </Button>
          </form>

          <p className="text-sm text-purple-300/70 text-center pt-2">
            Secure admin portal for Game Injector
          </p>
        </div>
      </div>
    </div>
  );
}

export function useAdminAuth() {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return localStorage.getItem(ADMIN_SESSION_KEY) === "true";
  });
  const backendAuth = useBackendAuthenticate();

  const authenticate = () => {
    setIsAdminAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    localStorage.removeItem("adminUsername");
    localStorage.removeItem("adminPassword");
    localStorage.removeItem("userRole");
    localStorage.removeItem("resellerId");
    setIsAdminAuthenticated(false);
  };

  const reAuthenticate = async () => {
    const storedUsername = localStorage.getItem("adminUsername");
    const storedPassword = localStorage.getItem("adminPassword");
    
    if (storedUsername && storedPassword) {
      try {
        await backendAuth.mutateAsync({
          username: storedUsername,
          password: storedPassword,
        });
        return true;
      } catch (err) {
        console.error("Re-authentication failed:", err);
        logout();
        return false;
      }
    }
    return false;
  };

  return {
    isAdminAuthenticated,
    authenticate,
    logout,
    reAuthenticate,
  };
}
