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
import { PurpleParticles } from "./PurpleParticles";
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
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Purple-white gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-purple-800" />
      
      {/* Animated pulsing radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.08),transparent_50%)]">
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.05),transparent_60%)]" />
      </div>
      
      {/* Moving white particles */}
      <PurpleParticles />
      
      <div className="relative z-10">
        <header className="border-b border-white/10 bg-black/20 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-300" />
              <div>
                <h1 className="text-xl font-bold text-white">{panelName}</h1>
                <p className="text-xs text-purple-200">
                  Reseller Portal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {reseller && (
                <div className="flex items-center gap-2 px-3 py-1 bg-purple-600/30 backdrop-blur-sm border border-white/20 rounded-full">
                  <span className="text-sm font-medium text-white">{reseller.username}</span>
                  <Badge variant="secondary" className="gap-1 font-mono bg-white/20 text-white border-0">
                    <Coins className="h-3 w-3" />
                    {reseller.credits.toString()}
                  </Badge>
                </div>
              )}
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-white hover:bg-white/10">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
              <Button variant="outline" onClick={onLogout} className="gap-2 border-white/20 text-white hover:bg-white/10">
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
                <h2 className="text-3xl font-bold mb-2 text-white">Create Keys</h2>
                <p className="text-purple-200">
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
            <Card className="bg-black/30 backdrop-blur-sm border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Coins className="h-5 w-5 text-purple-300" />
                  Credit Information
                </CardTitle>
                <CardDescription className="text-purple-200">
                  Your current credit balance and key creation cost
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-purple-200">Available Credits</p>
                    <p className="text-3xl font-bold text-white">
                      {reseller?.credits.toString() || "0"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-200">Cost Per Key</p>
                    <p className="text-3xl font-bold text-white">
                      {keyCreditCost.toString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-200">Keys You Can Create</p>
                    <p className="text-3xl font-bold text-white">
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

        <footer className="border-t border-white/10 bg-black/20 backdrop-blur-md mt-16">
          <div className="container mx-auto px-4 py-6 text-center text-sm text-purple-200">
            © 2026. Made by Gaurav
          </div>
        </footer>
      </div>
    </div>
  );
}
