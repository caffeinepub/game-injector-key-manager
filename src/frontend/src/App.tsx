import { ThemeProvider } from "./components/theme-provider";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCards } from "@/components/StatsCards";
import { CreateKeyDialog } from "@/components/CreateKeyDialog";
import { KeysTable } from "@/components/KeysTable";
import { InjectorsSection } from "@/components/InjectorsSection";
import { AdminLogin, useAdminAuth } from "@/components/AdminLogin";
import { Shield, LogOut, Moon, Sun, Key, Gamepad2 } from "lucide-react";

function Dashboard() {
  const { logout: adminLogout } = useAdminAuth();

  const handleLogout = () => {
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
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
            <TabsTrigger value="keys" className="gap-2">
              <Key className="h-4 w-4" />
              Keys
            </TabsTrigger>
            <TabsTrigger value="injectors" className="gap-2">
              <Gamepad2 className="h-4 w-4" />
              Injectors
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
  const { isAdminAuthenticated, authenticate } = useAdminAuth();

  // Admin login gate - authenticate to access dashboard
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
      <Dashboard />
      <Toaster />
    </ThemeProvider>
  );
}
