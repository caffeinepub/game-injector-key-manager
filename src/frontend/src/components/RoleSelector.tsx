import { useState } from "react";
import { Skull, Users } from "lucide-react";
import { AdminLogin } from "./AdminLogin";
import { ResellerLogin } from "./ResellerLogin";
import { MovingParticles } from "./MovingParticles";

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
      {/* Black gradient background with red accents */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-red-950 to-black" />
      
      {/* Animated pulsing radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.15),transparent_50%)]">
        <div className="absolute inset-0 animate-pulse-slow bg-[radial-gradient(circle_at_30%_70%,rgba(220,38,38,0.12),transparent_60%)]" />
      </div>
      
      {/* Moving white particles */}
      <MovingParticles />
      
      {/* Moving diagonal lines effect */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-slide-down" />
        <div className="absolute top-1/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-slide-down-delayed" />
        <div className="absolute top-2/3 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent animate-slide-down-slow" />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="bg-black/40 backdrop-blur-xl border-2 border-red-500/40 shadow-2xl shadow-red-500/30 p-8 space-y-6 rounded-lg">
          {/* Glowing skull icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500 blur-xl opacity-60 animate-pulse" />
              <div className="relative h-20 w-20 rounded-full bg-gradient-to-br from-red-600 via-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/50">
                <Skull className="h-10 w-10 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Heading with custom Orbitron font */}
          <div className="space-y-2 text-center">
            <h1 
              className="text-3xl font-bold bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Welcome to ghop ghop dashboard
            </h1>
            <p className="text-gray-200/80">
              Select your role to continue
            </p>
          </div>

          {/* Reactive buttons */}
          <div className="space-y-4 pt-2">
            <button
              onClick={() => setSelectedRole("admin")}
              className="group relative w-full h-24 bg-gradient-to-br from-black/50 to-red-950/50 border-2 border-red-500/40 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-red-400 hover:shadow-lg hover:shadow-red-500/40 active:scale-[0.98]"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-600/0 to-rose-500/0 group-hover:from-red-500/20 group-hover:via-red-600/20 group-hover:to-rose-500/20 transition-all duration-300" />
              
              <div className="relative flex flex-col items-center justify-center gap-2 h-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Skull className="relative h-8 w-8 text-red-400 group-hover:text-red-300 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-gray-100 group-hover:text-red-300 transition-colors duration-300">Admin</div>
                  <div className="text-xs text-gray-300/70">
                    Full system access
                  </div>
                </div>
              </div>

              {/* Animated border gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-[-2px] bg-gradient-to-r from-red-600 via-red-500 to-rose-600 rounded-lg blur-sm -z-10" />
              </div>
            </button>

            <button
              onClick={() => setSelectedRole("reseller")}
              className="group relative w-full h-24 bg-gradient-to-br from-black/50 to-red-950/50 border-2 border-red-500/40 rounded-lg overflow-hidden transition-all duration-300 hover:scale-[1.03] hover:border-red-400 hover:shadow-lg hover:shadow-red-500/40 active:scale-[0.98]"
            >
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-red-500/0 to-red-600/0 group-hover:from-rose-500/20 group-hover:via-red-500/20 group-hover:to-red-600/20 transition-all duration-300" />
              
              <div className="relative flex flex-col items-center justify-center gap-2 h-full">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <Users className="relative h-8 w-8 text-red-400 group-hover:text-rose-300 transition-colors duration-300" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-gray-100 group-hover:text-rose-300 transition-colors duration-300">Reseller</div>
                  <div className="text-xs text-gray-300/70">
                    Create keys with credits
                  </div>
                </div>
              </div>

              {/* Animated border gradient on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute inset-[-2px] bg-gradient-to-r from-rose-600 via-red-500 to-red-600 rounded-lg blur-sm -z-10" />
              </div>
            </button>
          </div>

          {/* Footer attribution */}
          <p className="text-sm text-gray-300/70 text-center pt-2 font-medium">
            made by Gaurav
          </p>
        </div>
      </div>
    </div>
  );
}
