import { useAdminAuth } from "@/components/AdminLogin";
import { ApiDocsSection } from "@/components/ApiDocsSection";
import { CreateKeyDialog } from "@/components/CreateKeyDialog";
import { InjectorsSection } from "@/components/InjectorsSection";
import { KeyStatsChart } from "@/components/KeyStatsChart";
import { KeysTable } from "@/components/KeysTable";
import { ResellerDashboard } from "@/components/ResellerDashboard";
import { ResellersSection } from "@/components/ResellersSection";
import { RoleSelector, type UserRole } from "@/components/RoleSelector";
import { SettingsSection } from "@/components/SettingsSection";
import { StatsCards } from "@/components/StatsCards";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { useGetPanelSettings } from "@/hooks/useQueries";
import {
  FileCode,
  Gamepad2,
  Key,
  LogOut,
  Plus,
  Settings,
  Shield,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { ResellerId } from "./backend";
import { ThemeProvider } from "./components/theme-provider";

type AdminSection =
  | "keys"
  | "injectors"
  | "resellers"
  | "api-docs"
  | "settings";

function AdminSidebar({
  activeSection,
  onSectionChange,
  panelName,
  onLogout,
  onCreateKey,
}: {
  activeSection: AdminSection;
  onSectionChange: (s: AdminSection) => void;
  panelName: string;
  onLogout: () => void;
  onCreateKey: () => void;
}) {
  const navItems: { id: AdminSection; label: string; icon: React.ReactNode }[] =
    [
      {
        id: "keys",
        label: "License Manager",
        icon: <Key className="h-4 w-4" />,
      },
      {
        id: "injectors",
        label: "Injectors",
        icon: <Gamepad2 className="h-4 w-4" />,
      },
      {
        id: "resellers",
        label: "Resellers",
        icon: <Users className="h-4 w-4" />,
      },
      {
        id: "api-docs",
        label: "API Docs",
        icon: <FileCode className="h-4 w-4" />,
      },
      {
        id: "settings",
        label: "Settings",
        icon: <Settings className="h-4 w-4" />,
      },
    ];

  return (
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
              License Manager
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        <div className="text-xs text-gray-600 uppercase tracking-widest font-bold px-3 pb-2 pt-1">
          Main
        </div>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            data-ocid={`sidebar.${item.id}.link`}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
              activeSection === item.id
                ? "bg-purple-600/20 text-white border border-purple-600/30"
                : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        {/* Generate Key shortcut */}
        <div className="pt-2">
          <button
            type="button"
            data-ocid="sidebar.generate_keys.button"
            onClick={onCreateKey}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 border border-transparent transition-all duration-150"
          >
            <Plus className="h-4 w-4" />
            Generate Keys
          </button>
        </div>
      </nav>

      {/* Bottom user + logout */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            G
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              Gaurav
            </div>
            <div className="text-xs text-gray-500">Administrator</div>
          </div>
        </div>
        <button
          type="button"
          data-ocid="sidebar.logout.button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-900/20 border border-red-800/30 hover:border-red-700/50 transition-all duration-150"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function Dashboard() {
  const { logout: adminLogout, reAuthenticate } = useAdminAuth();
  const [isReauthenticating, setIsReauthenticating] = useState(true);
  const { data: panelSettings } = useGetPanelSettings();
  const [panelName, setPanelName] = useState("Game Injector");
  const [activeSection, setActiveSection] = useState<AdminSection>("keys");
  const [showCreateKey, setShowCreateKey] = useState(false);

  useEffect(() => {
    const authenticate = async () => {
      await reAuthenticate();
      setIsReauthenticating(false);
    };
    authenticate();
  }, [reAuthenticate]);

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

  if (isReauthenticating) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0b0d14" }}
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full border-2 border-purple-600/30 border-t-purple-500 animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: "#0b0d14" }}
    >
      <AdminSidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        panelName={panelName}
        onLogout={adminLogout}
        onCreateKey={() => {
          setActiveSection("keys");
          setShowCreateKey(true);
        }}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">
          {activeSection === "keys" && (
            <>
              {/* Page header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    License Manager
                  </h2>
                  <p className="text-gray-500 text-sm">
                    Manage authentication keys
                  </p>
                </div>
                <CreateKeyDialog
                  externalOpen={showCreateKey}
                  onExternalOpenChange={setShowCreateKey}
                />
              </div>
              <StatsCards />
              <KeyStatsChart />
              <KeysTable />
            </>
          )}
          {activeSection === "injectors" && <InjectorsSection />}
          {activeSection === "resellers" && <ResellersSection />}
          {activeSection === "api-docs" && <ApiDocsSection />}
          {activeSection === "settings" && (
            <SettingsSection onPanelNameChange={setPanelName} />
          )}
        </div>

        <footer className="px-6 py-4 border-t border-white/5 mt-8">
          <p className="text-xs text-gray-600 text-center">
            © 2026. Made by Gaurav
          </p>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  const { isAdminAuthenticated, authenticate, logout } = useAdminAuth();
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const storedRole = localStorage.getItem("userRole");
    return storedRole === "admin" || storedRole === "reseller"
      ? storedRole
      : null;
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

  const isAuthenticated =
    userRole === "admin"
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

  if (userRole === "reseller" && resellerId) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="theme">
        <ResellerDashboard resellerId={resellerId} onLogout={handleLogout} />
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
