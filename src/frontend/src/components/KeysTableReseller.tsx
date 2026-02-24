import { useState } from "react";
import { useGetKeysByReseller, useGetAllInjectors } from "@/hooks/useQueries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Smartphone } from "lucide-react";
import { toast } from "sonner";
import type { LoginKey, ResellerId } from "../backend";

function formatTimestamp(timestamp?: bigint): string {
  if (!timestamp || timestamp === BigInt(0)) {
    return "Never";
  }
  const ms = Number(timestamp) / 1_000_000;
  const date = new Date(ms);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Key copied to clipboard");
}

interface KeysTableResellerProps {
  resellerId: ResellerId;
}

export function KeysTableReseller({ resellerId }: KeysTableResellerProps) {
  const { data: keys = [], isLoading } = useGetKeysByReseller(resellerId);
  const { data: injectors = [] } = useGetAllInjectors();

  // Helper function to get injector name by ID
  const getInjectorName = (injectorId?: bigint): string => {
    if (!injectorId) return "General";
    const injector = injectors.find((inj) => inj.id === injectorId);
    return injector ? injector.name : "Unknown";
  };

  // Helper function to format device usage
  const getDeviceUsageDisplay = (key: LoginKey) => {
    const current = Number(key.deviceCount);
    const max = key.maxDevices ? Number(key.maxDevices) : null;
    
    if (max === null) {
      return { text: "Unlimited", variant: "secondary" as const };
    }
    
    const percentage = (current / max) * 100;
    let variant: "default" | "secondary" | "destructive" = "default";
    
    if (current >= max) {
      variant = "destructive";
    } else if (percentage >= 80) {
      variant = "secondary";
    }
    
    return { text: `${current} / ${max}`, variant };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Login Keys</CardTitle>
          <CardDescription>
            View and manage keys you've created
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Login Keys</CardTitle>
        <CardDescription>
          View and manage keys you've created
        </CardDescription>
      </CardHeader>
      <CardContent>
        {keys.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No keys created yet. Click "Create Key" to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-mono">ID</TableHead>
                  <TableHead className="font-mono">Key Value</TableHead>
                  <TableHead>Injector</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Used</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id.toString()}>
                    <TableCell className="font-mono text-xs">
                      {key.id.toString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-muted font-mono text-xs">
                          {key.key.substring(0, 16)}...
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(key.key)}
                          className="h-7 w-7 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-medium">
                        {getInjectorName(key.injector)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatTimestamp(key.created)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatTimestamp(key.expires)}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const deviceUsage = getDeviceUsageDisplay(key);
                        const isAtLimit = key.maxDevices && 
                          key.deviceCount >= key.maxDevices;
                        
                        return (
                          <Badge
                            variant={deviceUsage.variant}
                            className="gap-1 font-mono"
                          >
                            <Smartphone className="h-3 w-3" />
                            {deviceUsage.text}
                            {isAtLimit && " (Limit Reached)"}
                          </Badge>
                        );
                      })()}
                    </TableCell>
                    <TableCell>
                      {key.blocked ? (
                        <Badge variant="destructive" className="gap-1">
                          Blocked
                        </Badge>
                      ) : (
                        <Badge
                          variant="default"
                          className="gap-1 bg-success text-success-foreground hover:bg-success/90"
                        >
                          Active
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {key.used.toString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
