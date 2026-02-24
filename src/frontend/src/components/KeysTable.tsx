import { useState } from "react";
import { useGetAllKeys, useBlockKey, useUnblockKey } from "@/hooks/useQueries";
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
import { Copy, Lock, Unlock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { LoginKey } from "../backend";

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

interface ConfirmDialog {
  open: boolean;
  key: LoginKey | null;
  action: "block" | "unblock";
}

export function KeysTable() {
  const { data: keys = [], isLoading } = useGetAllKeys();
  const blockKey = useBlockKey();
  const unblockKey = useUnblockKey();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    key: null,
    action: "block",
  });

  const handleBlockUnblock = async () => {
    if (!confirmDialog.key) return;

    try {
      if (confirmDialog.action === "block") {
        await blockKey.mutateAsync(confirmDialog.key.id);
        toast.success("Key blocked successfully");
      } else {
        await unblockKey.mutateAsync(confirmDialog.key.id);
        toast.success("Key unblocked successfully");
      }
      setConfirmDialog({ open: false, key: null, action: "block" });
    } catch (error) {
      toast.error(`Failed to ${confirmDialog.action} key`);
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login Keys</CardTitle>
          <CardDescription>
            Manage authentication keys for game injector access
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
          <CardTitle>Login Keys</CardTitle>
          <CardDescription>
            Manage authentication keys for game injector access
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
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
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
                      <TableCell className="text-sm">
                        {formatTimestamp(key.created)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(key.expires)}
                      </TableCell>
                      <TableCell>
                        {key.blocked ? (
                          <Badge
                            variant="destructive"
                            className="gap-1 animate-pulse"
                          >
                            <Lock className="h-3 w-3" />
                            Blocked
                          </Badge>
                        ) : (
                          <Badge
                            variant="default"
                            className="gap-1 bg-success text-success-foreground hover:bg-success/90"
                          >
                            <Unlock className="h-3 w-3" />
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {key.used.toString()}
                      </TableCell>
                      <TableCell className="text-right">
                        {key.blocked ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                key,
                                action: "unblock",
                              })
                            }
                            className="gap-2"
                          >
                            <Unlock className="h-3 w-3" />
                            Unblock
                          </Button>
                        ) : (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              setConfirmDialog({
                                open: true,
                                key,
                                action: "block",
                              })
                            }
                            className="gap-2"
                          >
                            <Lock className="h-3 w-3" />
                            Block
                          </Button>
                        )}
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
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, key: null, action: "block" })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmDialog.action === "block" ? "Block Key?" : "Unblock Key?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDialog.action === "block"
                ? "This key will be immediately blocked and cannot be used for authentication. You can unblock it later if needed."
                : "This key will be unblocked and can be used for authentication again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBlockUnblock}
              disabled={blockKey.isPending || unblockKey.isPending}
              className={
                confirmDialog.action === "block"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : ""
              }
            >
              {(blockKey.isPending || unblockKey.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {confirmDialog.action === "block" ? "Block Key" : "Unblock Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
