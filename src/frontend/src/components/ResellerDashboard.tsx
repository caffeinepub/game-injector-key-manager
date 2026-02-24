import { useState, useEffect } from "react";
import { ThemeProvider } from "./theme-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield, LogOut, Coins, Key, Moon, Sun } from "lucide-react";
import { CreateKeyDialogReseller } from "./CreateKeyDialogReseller";
import { KeysTableReseller } from "./KeysTableReseller";
import { useGetResellerById, useGetKeyCreditCost, useGetPanelSettings } from "@/hooks/useQueries";
import type { ResellerId } from "../backend";

interface ResellerDashboardProps {
  resellerId: ResellerId;
  onLogout: () => void;
}

export function ResellerDashboard({ resellerId, onLogout }: ResellerDashboardProps) {
  const { data: reseller } = useGetResellerById(resellerId);
  const { data: keyCreditCost = BigInt(1) } = useGetKeyCreditCost();
  const { data: panelSettings } = useGetPanelSettings();
  const [panelName, setPanelName] = useState("Game Injector");

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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-bold">{panelName}</h1>
              <p className="text-xs text-muted-foreground">
                Reseller Portal
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {reseller && (
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full">
                <span className="text-sm font-medium">{reseller.username}</span>
                <Badge variant="secondary" className="gap-1 font-mono">
                  <Coins className="h-3 w-3" />
                  {reseller.credits.toString()}
                </Badge>
              </div>
            )}
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="outline" onClick={onLogout} className="gap-2">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Create Keys</h2>
              <p className="text-muted-foreground">
                Generate authentication keys using your credits
              </p>
            </div>
            <CreateKeyDialogReseller
              resellerId={resellerId}
              currentCredits={reseller?.credits || BigInt(0)}
              creditCost={keyCreditCost}
            />
          </div>

          {/* Credit Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Credit Information
              </CardTitle>
              <CardDescription>
                Your current credit balance and key creation cost
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Available Credits</p>
                  <p className="text-3xl font-bold">
                    {reseller?.credits.toString() || "0"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Cost Per Key</p>
                  <p className="text-3xl font-bold">
                    {keyCreditCost.toString()}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Keys You Can Create</p>
                  <p className="text-3xl font-bold">
                    {reseller
                      ? (reseller.credits / keyCreditCost).toString()
                      : "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Keys Table */}
          <KeysTableReseller resellerId={resellerId} />
        </div>
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
