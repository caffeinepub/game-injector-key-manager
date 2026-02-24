import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Lock, User, AlertCircle, ArrowLeft } from "lucide-react";
import { useResellerAuthenticate } from "@/hooks/useQueries";

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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border p-8 space-y-6">
          {onBack && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-2 -mt-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Reseller Login</h1>
            <p className="text-muted-foreground">
              Enter your credentials to access the reseller portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
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
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
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
                className="w-full"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || !username || !password}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "Authenticating..." : "Login"}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center">
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
