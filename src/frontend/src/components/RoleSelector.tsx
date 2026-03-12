import { Shield, Users } from "lucide-react";
import { useState } from "react";
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
        onAuthenticated={(resellerId) =>
          onAuthenticated("reseller", resellerId)
        }
        onBack={() => setSelectedRole(null)}
      />
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(124,58,237,0.18) 0%, rgba(88,28,235,0.08) 40%, transparent 70%), #0b0d14",
      }}
    >
      <div className="max-w-sm w-full mx-4">
        <div
          className="rounded-3xl border border-purple-900/40 p-8 space-y-6"
          style={{
            background: "#111827",
            boxShadow:
              "0 0 60px rgba(124,58,237,0.12), 0 25px 50px rgba(0,0,0,0.5)",
          }}
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  boxShadow: "0 0 30px rgba(124,58,237,0.6)",
                  borderRadius: "1rem",
                }}
              />
              <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "'Orbitron', sans-serif" }}
            >
              Welcome to ghop ghop dashboard
            </h1>
            <p className="text-gray-400 text-sm">
              Select your role to continue
            </p>
          </div>

          {/* Role buttons */}
          <div className="space-y-3 pt-1">
            <button
              type="button"
              data-ocid="role_selector.admin.button"
              onClick={() => setSelectedRole("admin")}
              className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-800/40 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-600/60 transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600/30 transition-colors">
                <Shield className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Admin</div>
                <div className="text-xs text-gray-400">Full system access</div>
              </div>
            </button>

            <button
              type="button"
              data-ocid="role_selector.reseller.button"
              onClick={() => setSelectedRole("reseller")}
              className="group w-full flex items-center gap-4 p-4 rounded-2xl border border-purple-800/40 bg-purple-950/20 hover:bg-purple-900/30 hover:border-purple-600/60 transition-all duration-200 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)] active:scale-[0.98]"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center shrink-0 group-hover:bg-purple-600/30 transition-colors">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-white">Reseller</div>
                <div className="text-xs text-gray-400">
                  Create keys with credits
                </div>
              </div>
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center">made by Gaurav</p>
        </div>
      </div>
    </div>
  );
}
