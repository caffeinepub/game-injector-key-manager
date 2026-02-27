import { useState } from "react";
import {
  useGetAllInjectors,
  useDeleteInjector,
} from "@/hooks/useQueries";
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
import { Copy, Trash2, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import type { Injector, InjectorId } from "../backend";

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

function copyToClipboard(text: string, label: string = "Copied") {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied to clipboard`);
}

interface ConfirmDialog {
  open: boolean;
  injector: Injector | null;
}

interface InjectorsTableProps {
  keyCounts?: Map<string, number>;
  onExportKeys?: (injectorId: InjectorId, injectorName: string) => void;
}

export function InjectorsTable({ keyCounts, onExportKeys }: InjectorsTableProps) {
  const { data: injectors = [], isLoading } = useGetAllInjectors();
  const deleteInjector = useDeleteInjector();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    injector: null,
  });

  const handleDelete = async () => {
    if (!confirmDialog.injector) return;

    try {
      await deleteInjector.mutateAsync(confirmDialog.injector.id);
      toast.success("Injector deleted successfully");
      setConfirmDialog({ open: false, injector: null });
    } catch (error) {
      toast.error("Failed to delete injector");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Game Injectors</CardTitle>
          <CardDescription>
            Manage registered game injectors and their key assignments
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
          <CardTitle>Game Injectors</CardTitle>
          <CardDescription>
            Manage registered game injectors and their key assignments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {injectors.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No injectors registered yet. Click "Add Injector" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Injector ID</TableHead>
                    <TableHead>Total Keys</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {injectors.map((injector) => {
                    const keyCount = keyCounts?.get(injector.id.toString()) ?? 0;
                    return (
                      <TableRow key={injector.id.toString()}>
                        <TableCell className="font-medium">
                          {injector.name}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <code className="px-2 py-1 bg-muted font-mono text-xs">
                              {injector.id.toString()}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyToClipboard(injector.id.toString(), "Injector ID")
                              }
                              className="h-7 w-7 p-0 shrink-0"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono font-medium">{keyCount}</span>
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTimestamp(injector.created)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {onExportKeys && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  onExportKeys(injector.id, injector.name)
                                }
                                className="gap-2"
                              >
                                <Download className="h-3 w-3" />
                                Export
                              </Button>
                            )}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setConfirmDialog({
                                  open: true,
                                  injector,
                                })
                              }
                              className="gap-2"
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog.open}
        onOpenChange={(open) =>
          !open && setConfirmDialog({ open: false, injector: null })
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Injector?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{confirmDialog.injector?.name}".
              All keys assigned to this injector will become unassigned. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteInjector.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInjector.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Injector
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
