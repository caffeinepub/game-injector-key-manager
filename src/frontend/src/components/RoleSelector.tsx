import { useState } from "react";
import { Shield, Users } from "lucide-react";
import { AdminLogin } from "./AdminLogin";
import { ResellerLogin } from "./ResellerLogin";

export type UserRole = "admin" | "reseller";

interface RoleSelectorProps {
  onAuthenticated: (role: UserRole, resellerId?: bigint) => void;
}

export function RoleSelector({ onAuthenticated }: RoleSelectorProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  if (selectedRole === "admin") {
    return (
      <AdminLogin
        onAuthenticated={() => onAuthenticated("admin")}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  if (selectedRole === "reseller") {
    return (
      <ResellerLogin
        onAuthenticated={(resellerId) => onAuthenticated("reseller", resellerId)}
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Live animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-violet-900 to-purple-950" />
      
      {/* Animated pulsing radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.15),transparent_50%)]">
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_30%_70%,rgba(217,70,239,0.12),transparent_60%)]" />
      </div>
      
      {/* Floating animated particles/orbs */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-fuchsia-500/25 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/30 rounded-full blur-3xl animate-float-slow" />
      <div className="absolute top-40 right-40 w-48 h-48 bg-purple-600/20 rounded-full blur-2xl animate-float-reverse" />
      <div className="absolute bottom-40 left-40 w-56 h-56 bg-magenta-500/20 rounded-full blur-3xl animate-float" />
      
      {/* Moving diagonal lines effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-slide-down" />
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-fuchsia-400 to-transparent animate-slide-down-delayed" />
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-violet-400 to-transparent animate-slide-down-slow" />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-purple-950/40 backdrop-blur-xl border-2 border-purple-500/40 shadow-2xl shadow-purple-500/30 p-8 space-y-6 rounded-lg">
          {/* Glowing shield icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-purple-500 blur-xl opacity-60 animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-purple-500 via-fuchsia-500 to-violet-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
                <Shield className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Heading with custom Orbitron font */}
          <div className="space-y-2 text-center">
            <h1 
              className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-fuchsia-300 to-violet-300 bg-clip-text text-transparent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Welcome to ghop ghop dashboard
            </h1>
            <p className="text-purple-200/80">
              Select your role to continue
            </p>
          </div>

          {/* Reactive buttons */}
          <div className="space-y-4 pt-2">
            <button
              onClick={() => setSelectedRole("admin")}
              className="group relative w-full h-24 bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-2 border-purple-500/40 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/40 active:scale-[0.98]"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-fuchsia-500/0 to-violet-500/0 group-hover:from-purple-500/20 group-hover:via-fuchsia-500/20 group-hover:to-violet-500/20 transition-all duration-300" />
              
              <div className="relative flex flex-col items-center justify-center gap-2 h-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Shield className="relative h-8 w-8 text-purple-400 group-hover:text-fuchsia-300 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-purple-100 group-hover:text-fuchsia-300 transition-colors duration-300">Admin</div>
                  <div className="text-xs text-purple-300/70">
                    Full system access
                  </div>
                </div>
              </div>

              {/* Animated border gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-[-2px] bg-gradient-to-r from-purple-500 via-fuchsia-500 to-violet-500 rounded-lg blur-sm -z-10" />
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("reseller")}
              className="group relative w-full h-24 bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-2 border-purple-500/40 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/40 active:scale-[0.98]"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-purple-500/0 to-fuchsia-500/0 group-hover:from-violet-500/20 group-hover:via-purple-500/20 group-hover:to-fuchsia-500/20 transition-all duration-300" />
              
              <div className="relative flex flex-col items-center justify-center gap-2 h-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Users className="relative h-8 w-8 text-purple-400 group-hover:text-violet-300 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-purple-100 group-hover:text-violet-300 transition-colors duration-300">Reseller</div>
                  <div className="text-xs text-purple-300/70">
                    Create keys with credits
                  </div>
                </div>
              </div>

              {/* Animated border gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-[-2px] bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500 rounded-lg blur-sm -z-10" />
              </div>
            </button>
          </div>

          {/* Footer attribution */}
          <p className="text-sm text-purple-300/70 text-center pt-2 font-medium">
            made by Gaurav
          </p>
        </div>
      </div>
    </div>
  );
}
