import { ThemeProvider } from "./components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/StatsCards";
import { CreateKeyDialog } from "@/components/CreateKeyDialog";
import { KeysTable } from "@/components/KeysTable";
import { InjectorsSection } from "@/components/InjectorsSection";
import { ResellersSection } from "@/components/ResellersSection";
import { SettingsSection } from "@/components/SettingsSection";
import { RoleSelector, type UserRole } from "@/components/RoleSelector";
import { ResellerDashboard } from "@/components/ResellerDashboard";
import { useAdminAuth } from "@/components/AdminLogin";
import { Shield, LogOut, Moon, Sun, Key, Gamepad2, Settings, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useGetPanelSettings } from "@/hooks/useQueries";
import type { ResellerId } from "./backend";

function Dashboard() {
  const { logout: adminLogout, reAuthenticate } = useAdminAuth();
  const [isReauthenticating, setIsReauthenticating] = useState(true);
  const { data: panelSettings } = useGetPanelSettings();
  const [panelName, setPanelName] = useState("Game Injector");

  useEffect(() => {
    // Re-authenticate with backend on mount
    const authenticate = async () => {
      await reAuthenticate();
      setIsReauthenticating(false);
    };
    authenticate();
  }, [reAuthenticate]);

  // Update panel name when settings load or change
  useEffect(() => {
    if (panelSettings) {
      setPanelName(panelSettings.panelName);
      // Apply theme from settings
      const root = document.documentElement;
      root.setAttribute("data-theme", panelSettings.themePreset);
      if (panelSettings.themePreset === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
    }
  }, [panelSettings]);

  const handleLogout = () => {
    adminLogout();
  };

  if (isReauthenticating) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Shield className="h-12 w-12 text-primary mx-auto animate-pulse" />
          <p className="text-muted-foreground">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{panelName}</h1>
              <p className="text-xs text-muted-foreground">
                Admin Dashboard
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
        <Tabs defaultValue="keys" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4">
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              Keys
            </TabsTrigger>
            <TabsTrigger value="injectors" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Injectors
            </TabsTrigger>
            <TabsTrigger value="resellers" className="gap-2">
              <Users className="h-4 w-4" />
              Resellers
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keys" className="space-y-6">
            <div className="flex items-center justify-between">
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
          </TabsContent>

          <TabsContent value="injectors" className="space-y-6">
            <InjectorsSection />
          </TabsContent>

          <TabsContent value="resellers" className="space-y-6">
            <ResellersSection />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <SettingsSection onPanelNameChange={setPanelName} />
          </TabsContent>
        </Tabs>
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
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-theme") || "default";
    
    // Simple toggle between light and dark
    if (currentTheme === "light") {
      root.setAttribute("data-theme", "default");
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
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
  const { isAdminAuthenticated, authenticate, logout } = useAdminAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const storedRole = localStorage.getItem("userRole");
    return storedRole === "admin" || storedRole === "reseller" ? storedRole : null;
  });
  const [resellerId, setResellerId] = useState<ResellerId | null>(() => {
    const storedId = localStorage.getItem("resellerId");
    return storedId ? BigInt(storedId) : null;
  });

  const handleAuthenticated = (role: UserRole, resellerIdArg?: bigint) => {
    setUserRole(role);
    if (role === "admin") {
      authenticate();
    } else if (role === "reseller" && resellerIdArg) {
      setResellerId(resellerIdArg);
    }
  };

  const handleLogout = () => {
    logout();
    setUserRole(null);
    setResellerId(null);
  };

  // Check if user is authenticated
  const isAuthenticated = userRole === "admin" 
    ? isAdminAuthenticated 
    : userRole === "reseller" && resellerId !== null;

  if (!isAuthenticated) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <RoleSelector onAuthenticated={handleAuthenticated} />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render reseller dashboard if reseller
  if (userRole === "reseller" && resellerId) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <ResellerDashboard resellerId={resellerId} onLogout={handleLogout} />
        <Toaster />
      </ThemeProvider>
    );
  }

  // Render admin dashboard
  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <Dashboard />
      <Toaster />
    </ThemeProvider>
  );
}
