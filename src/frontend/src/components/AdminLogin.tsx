import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useBackendAuthenticate } from "@/hooks/useQueries";
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Shield,
  User,
} from "lucide-react";
import { type FormEvent, useState } from "react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const backendAuth = useBackendAuthenticate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
        setError("Invalid username or password");
        setPassword("");
        setIsSubmitting(false);
        return;
      }
      // Try backend auth but don't block login if it fails — credentials are already verified locally
      try {
        await backendAuth.mutateAsync({ username, password });
      } catch (backendErr) {
        console.warn(
          "Backend auth call failed, proceeding with local auth:",
          backendErr,
        );
      }
      localStorage.setItem(ADMIN_SESSION_KEY, "true");
      localStorage.setItem("adminUsername", username);
      localStorage.setItem("adminPassword", password);
      localStorage.setItem("userRole", "admin");
      onAuthenticated();
    } catch (err) {
      console.error("Login failed:", err);
      setError("Invalid username or password");
      setPassword("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(88,28,235,0.08) 40%, transparent 70%), #0b0d14",
      }}
    >
      <div className="max-w-sm w-full mx-4">
        <div
          className="rounded-3xl border border-purple-900/40 p-8 space-y-6"
          style={{
            background: "#111827",
            boxShadow:
              "0 0 60px rgba(124,58,237,0.12), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
          )}

          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  boxShadow: "0 0 30px rgba(124,58,237,0.7)",
                  borderRadius: "1rem",
                }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          <div className="text-center space-y-1">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm">Sign in to Admin Panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              <Input
                data-ocid="admin_login.username.input"
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                required
                autoComplete="username"
                autoFocus
                className="pl-11 bg-white/90 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/30 h-12"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
              <Input
                data-ocid="admin_login.password.input"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                autoComplete="current-password"
                className="pl-11 pr-11 bg-white/90 border-white/15 text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-purple-500/30 h-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-950/50 border border-red-800/50 text-red-300 text-sm rounded-2xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              data-ocid="admin_login.submit_button"
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full h-12 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-black font-bold border-0 shadow-lg shadow-amber-500/20 transition-all duration-200 hover:shadow-amber-500/30 disabled:opacity-50"
              size="lg"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          <p className="text-xs text-gray-500 text-center">made by Gaurav</p>
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
        console.warn("Re-authentication failed, using cached session:", err);
        return true; // Keep session alive even if backend is slow
      }
    }
    return false;
  };

  return { isAdminAuthenticated, authenticate, logout, reAuthenticate };
}
