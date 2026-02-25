import { useState } from "react";
import { useGetKeysByReseller, useGetAllInjectors, useDeleteKey } from "@/hooks/useQueries";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Loader2, Smartphone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LoginKey, ResellerId } from "../backend";
import { KeyDetailsModal } from "./KeyDetailsModal";

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

interface DeleteDialog {
  open: boolean;
  key: LoginKey | null;
}

export function KeysTableReseller({ resellerId }: KeysTableResellerProps) {
  const { data: keys = [], isLoading } = useGetKeysByReseller(resellerId);
  const { data: injectors = [] } = useGetAllInjectors();
  const deleteKey = useDeleteKey();
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    key: null,
  });
  const [selectedKey, setSelectedKey] = useState<LoginKey | null>(null);

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

  const handleDelete = async () => {
    if (!deleteDialog.key) return;

    try {
      await deleteKey.mutateAsync(deleteDialog.key.id);
      toast.success("Key deleted successfully");
      setDeleteDialog({ open: false, key: null });
    } catch (error) {
      toast.error("Failed to delete key");
      console.error(error);
    }
  };

  const handleRowClick = (e: React.MouseEvent, key: LoginKey) => {
    // Don't open modal if clicking on action buttons or their children
    const target = e.target as HTMLElement;
    const isActionButton = target.closest('button') || target.closest('[role="button"]');
    
    if (!isActionButton) {
      setSelectedKey(key);
    }
  };

  const handleModalDelete = () => {
    if (selectedKey) {
      setDeleteDialog({ open: true, key: selectedKey });
      setSelectedKey(null);
    }
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
    <>
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
                    <TableHead className="font-mono min-w-[200px]">Key Value</TableHead>
                    <TableHead>Injector</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Devices</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {keys.map((key) => (
                    <TableRow 
                      key={key.id.toString()}
                      onClick={(e) => handleRowClick(e, key)}
                      className="cursor-pointer hover:bg-purple-50/50 dark:hover:bg-purple-950/20 transition-colors"
                    >
                      <TableCell className="font-mono text-xs">
                        {key.id.toString()}
                      </TableCell>
                      <TableCell className="min-w-[200px]">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-muted font-mono text-xs">
                            {key.key}
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
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() =>
                            setDeleteDialog({
                              open: true,
                              key,
                            })
                          }
                          className="gap-2"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) =>
          !open && setDeleteDialog({ open: false, key: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Key?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this key? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteKey.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteKey.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Key
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <KeyDetailsModal
        keyData={selectedKey}
        open={!!selectedKey}
        onOpenChange={(open) => !open && setSelectedKey(null)}
        onDelete={handleModalDelete}
        showBlockUnblock={false}
        isDeleting={deleteKey.isPending}
        getInjectorName={getInjectorName}
        getDeviceUsageDisplay={getDeviceUsageDisplay}
        formatTimestamp={formatTimestamp}
      />
    </>
  );
}
