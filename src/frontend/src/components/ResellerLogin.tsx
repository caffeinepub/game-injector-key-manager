import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { useResellerAuthenticate } from "@/hooks/useQueries";
import { MovingParticles } from "./MovingParticles";

const RESELLER_SESSION_KEY = "resellerAuthenticated";

interface ResellerLoginProps {
  onAuthenticated: (resellerId: bigint) => void;
  onBack?: () => void;
}

export function ResellerLogin({ onAuthenticated, onBack }: ResellerLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const resellerAuth = useResellerAuthenticate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Authenticate with backend - returns reseller ID on success
      const resellerId = await resellerAuth.mutateAsync({ username, password });
      
      // Store credentials for re-authentication if needed
      localStorage.setItem(RESELLER_SESSION_KEY, "true");
      localStorage.setItem("resellerUsername", username);
      localStorage.setItem("resellerPassword", password);
      localStorage.setItem("resellerId", resellerId.toString());
      localStorage.setItem("userRole", "reseller");
      
      onAuthenticated(resellerId);
    } catch (err: any) {
      console.error("Reseller authentication failed:", err);
      setError(err.message || "Invalid username or password");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Black gradient background with red accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950 to-black" />
      
      {/* Animated pulsing radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_50%)]">
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_30%_70%,rgba(220,38,38,0.12),transparent_60%)]" />
      </div>
      
      {/* Moving white particles */}
      <MovingParticles />
      
      {/* Moving diagonal lines effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-slide-down" />
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-slide-down-delayed" />
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-slide-down-slow" />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-black/40 backdrop-blur-xl border-2 border-red-500/40 shadow-2xl shadow-red-500/30 p-8 space-y-6 rounded-lg">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 -mt-2 text-gray-200 hover:text-gray-100 hover:bg-red-800/30"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          
          {/* Glowing users icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500 blur-xl opacity-60 animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                <Users className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>
          
          {/* Heading with custom Orbitron font */}
          <div className="space-y-2 text-center">
            <h1 
              className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Reseller Login
            </h1>
            <p className="text-gray-200/80">
              Enter your credentials to access the reseller portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2 text-gray-200">
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
                className="w-full bg-black/50 border-red-500/40 text-gray-100 placeholder:text-gray-400/50 focus:border-red-400 focus:ring-red-500/50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2 text-gray-200">
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
                className="w-full bg-black/50 border-red-500/40 text-gray-100 placeholder:text-gray-400/50 focus:border-red-400 focus:ring-red-500/50"
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
              className="w-full bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:via-rose-500 hover:to-red-500 text-white border-0 shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              size="lg"
            >
              {isSubmitting ? "Authenticating..." : "Login"}
            </Button>
          </form>

          <p className="text-sm text-gray-300/70 text-center pt-2">
            Reseller portal for Game Injector
          </p>
        </div>
      </div>
    </div>
  );
}

export function useResellerAuth() {
  const [isResellerAuthenticated, setIsResellerAuthenticated] = useState(() => {
    return localStorage.getItem(RESELLER_SESSION_KEY) === "true";
  });

  const authenticate = () => {
    setIsResellerAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem(RESELLER_SESSION_KEY);
    localStorage.removeItem("resellerUsername");
    localStorage.removeItem("resellerPassword");
    localStorage.removeItem("resellerId");
    localStorage.removeItem("userRole");
    setIsResellerAuthenticated(false);
  };

  return {
    isResellerAuthenticated,
    authenticate,
    logout,
  };
}
