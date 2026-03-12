import {
  useGetKeyCreditCost,
  useGetPanelSettings,
  useGetResellerById,
} from "@/hooks/useQueries";
import { Coins, Key, LogOut, Plus, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import type { ResellerId } from "../backend";
import { CreateKeyDialogReseller } from "./CreateKeyDialogReseller";
import { KeysTableReseller } from "./KeysTableReseller";
import { ThemeProvider } from "./theme-provider";

interface ResellerDashboardProps {
  resellerId: ResellerId;
  onLogout: () => void;
}

export function ResellerDashboard({
  resellerId,
  onLogout,
}: ResellerDashboardProps) {
  const { data: reseller } = useGetResellerById(resellerId);
  const { data: keyCreditCost = BigInt(1) } = useGetKeyCreditCost();
  const { data: panelSettings } = useGetPanelSettings();
  const [panelName, setPanelName] = useState("Game Injector");
  const [showCreateKey, setShowCreateKey] = useState(false);

  useEffect(() => {
    if (panelSettings) {
      setPanelName(panelSettings.panelName);
      const root = document.documentElement;
      root.setAttribute("data-theme", panelSettings.themePreset);
      if (panelSettings.themePreset === "light") {
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
    }
  }, [panelSettings]);

  const username =
    reseller?.username ||
    localStorage.getItem("resellerUsername") ||
    "Reseller";
  const credits = reseller?.credits || BigInt(0);
  const initials = username.slice(0, 2).toUpperCase();
  const canCreate = reseller ? reseller.credits / keyCreditCost : BigInt(0);

  return (
    <ThemeProvider defaultTheme="dark" storageKey="theme">
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: "#0b0d14" }}
      >
        {/* Sidebar */}
        <aside
          className="w-60 shrink-0 flex flex-col border-r border-white/5"
          style={{ background: "#0d1117" }}
        >
          {/* Logo */}
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-white text-sm leading-tight">
                  {panelName}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-widest">
                  Reseller Portal
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            <div className="text-xs text-gray-600 uppercase tracking-widest font-bold px-3 pb-2 pt-1">
              Main
            </div>
            <button
              type="button"
              data-ocid="reseller_sidebar.keys.link"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-purple-600/20 text-white border border-purple-600/30 transition-all duration-150"
            >
              <Key className="h-4 w-4" />
              License Manager
            </button>
            <button
              type="button"
              data-ocid="reseller_sidebar.generate_keys.button"
              onClick={() => setShowCreateKey(true)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-150"
            >
              <Plus className="h-4 w-4" />
              Generate Keys
            </button>
          </nav>

          {/* Bottom */}
          <div className="p-3 border-t border-white/5">
            {/* User info */}
            <div
              className="rounded-2xl border border-white/5 p-3 mb-3"
              style={{ background: "#111827" }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {username}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-medium text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded-full px-1.5 py-0.5">
                      RESELLER
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-gray-400">
                  <Coins className="h-3 w-3 text-amber-400" />
                  <span>Credits</span>
                </div>
                <span className="font-mono font-bold text-amber-400">
                  {credits.toString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              data-ocid="reseller_sidebar.logout.button"
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800/30 hover:border-red-700/50 transition-all duration-150"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Page header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  License Manager
                </h2>
                <p className="text-gray-500 text-sm">
                  Create and manage your keys
                </p>
              </div>
              <CreateKeyDialogReseller
                resellerId={resellerId}
                currentCredits={reseller?.credits || BigInt(0)}
                creditCost={keyCreditCost}
                externalOpen={showCreateKey}
                onExternalOpenChange={setShowCreateKey}
              />
            </div>

            {/* Credit info cards */}
            <div className="grid grid-cols-3 gap-4">
              {[
                {
                  label: "Available Credits",
                  value: credits.toString(),
                  color: "text-amber-400",
                  accent: "bg-gradient-to-r from-amber-400 to-orange-500",
                  icon: <Coins className="h-4 w-4 text-amber-400" />,
                  bg: "bg-amber-500/15",
                  tag: "BAL",
                  tagColor: "text-amber-400",
                },
                {
                  label: "Cost Per Key",
                  value: keyCreditCost.toString(),
                  color: "text-cyan-400",
                  accent: "bg-gradient-to-r from-cyan-400 to-cyan-600",
                  icon: <Key className="h-4 w-4 text-cyan-400" />,
                  bg: "bg-cyan-500/15",
                  tag: "COST",
                  tagColor: "text-cyan-400",
                },
                {
                  label: "Keys You Can Create",
                  value: canCreate.toString(),
                  color: "text-emerald-400",
                  accent: "bg-gradient-to-r from-emerald-400 to-green-500",
                  icon: <Plus className="h-4 w-4 text-emerald-400" />,
                  bg: "bg-emerald-500/15",
                  tag: "AVL",
                  tagColor: "text-emerald-400",
                },
              ].map((card) => (
                <div
                  key={card.label}
                  className="relative rounded-2xl border border-white/5 p-5 overflow-hidden"
                  style={{ background: "#111827" }}
                >
                  <div
                    className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${card.accent}`}
                  />
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}
                    >
                      {card.icon}
                    </div>
                    <span
                      className={`text-xs font-bold font-mono tracking-widest ${card.tagColor}`}
                    >
                      {card.tag}
                    </span>
                  </div>
                  <div
                    className={`text-3xl font-bold font-mono mb-1 ${card.color}`}
                  >
                    {card.value}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider">
                    {card.label}
                  </div>
                </div>
              ))}
            </div>

            <KeysTableReseller resellerId={resellerId} />
          </div>

          <footer className="px-6 py-4 border-t border-white/5 mt-8">
            <p className="text-xs text-gray-600 text-center">
              © 2026. Made by Gaurav
            </p>
          </footer>
        </main>
      </div>
    </ThemeProvider>
  );
}
