import { useGetAllKeys } from "@/hooks/useQueries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Lock, Unlock } from "lucide-react";

export function StatsCards() {
  const { data: keys = [], isLoading } = useGetAllKeys();

  const totalKeys = keys.length;
  const activeKeys = keys.filter((key) => !key.blocked).length;
  const blockedKeys = keys.filter((key) => key.blocked).length;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Keys</CardTitle>
          <Key className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono">{totalKeys}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
          <Unlock className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-success">
            {activeKeys}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Blocked Keys</CardTitle>
          <Lock className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold font-mono text-destructive">
            {blockedKeys}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
