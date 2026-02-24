import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { ThemeProvider } from "./components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { StatsCards } from "@/components/StatsCards";
import { CreateKeyDialog } from "@/components/CreateKeyDialog";
import { KeysTable } from "@/components/KeysTable";
import { AdminLogin, useAdminAuth } from "@/components/AdminLogin";
import { Shield, LogOut, Moon, Sun, Loader2 } from "lucide-react";

function LoginScreen() {
  const { login, loginStatus } = useInternetIdentity();
  const isLoggingIn = loginStatus === "logging-in";

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Game Injector Dashboard</h1>
            <p className="text-muted-foreground">
              Secure login key management system
            </p>
          </div>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full gap-2"
            size="lg"
          >
            {isLoggingIn && <Loader2 className="h-4 w-4 animate-spin" />}
            {isLoggingIn ? "Connecting..." : "Login to Continue"}
          </Button>
          <p className="text-xs text-muted-foreground">
            Powered by Internet Identity
          </p>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { clear, identity } = useInternetIdentity();
  const { logout: adminLogout } = useAdminAuth();
  const principal = identity?.getPrincipal().toString();

  const handleLogout = () => {
    clear();
    adminLogout();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">Game Injector</h1>
              <p className="text-xs text-muted-foreground font-mono">
                {principal?.substring(0, 20)}...
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Login Key Management</h2>
            <p className="text-muted-foreground">
              Create, monitor, and control authentication keys
            </p>
          </div>
          <CreateKeyDialog />
        </div>

        <StatsCards />
        <KeysTable />
      </main>

      <footer className="border-t border-border bg-card mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}

function ThemeToggle() {
  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme}>
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default function App() {
  const { loginStatus, isInitializing } = useInternetIdentity();
  const { isAdminAuthenticated, authenticate } = useAdminAuth();

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Admin login gate - must authenticate before Internet Identity
  if (!isAdminAuthenticated) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <AdminLogin onAuthenticated={authenticate} />
        <Toaster />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      {loginStatus === "success" ? <Dashboard /> : <LoginScreen />}
      <Toaster />
    </ThemeProvider>
  );
}
