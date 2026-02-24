import { useState } from "react";
import { Button } from "@/components/ui/button";
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full mx-4">
        <div className="bg-card border border-border p-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold">Welcome</h1>
            <p className="text-muted-foreground">
              Select your role to continue
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setSelectedRole("admin")}
            >
              <Shield className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Admin</div>
                <div className="text-xs text-muted-foreground">
                  Full system access
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="w-full h-20 flex flex-col gap-2 hover:border-primary hover:bg-primary/5"
              onClick={() => setSelectedRole("reseller")}
            >
              <Users className="h-6 w-6" />
              <div className="text-center">
                <div className="font-semibold">Reseller</div>
                <div className="text-xs text-muted-foreground">
                  Create keys with credits
                </div>
              </div>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Secure portal for Game Injector
          </p>
        </div>
      </div>
    </div>
  );
}
