import { useState, useEffect } from "react";
import {
  useGetAllInjectors,
  useDeleteInjector,
  useGenerateLoginRedirectUrl,
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
import { Copy, Trash2, Loader2, ExternalLink } from "lucide-react";
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

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Login URL copied to clipboard");
}

interface ConfirmDialog {
  open: boolean;
  injector: Injector | null;
}

export function InjectorsTable() {
  const { data: injectors = [], isLoading } = useGetAllInjectors();
  const deleteInjector = useDeleteInjector();
  const generateUrl = useGenerateLoginRedirectUrl();
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    injector: null,
  });
  const [loginUrls, setLoginUrls] = useState<Map<string, string>>(new Map());

  // Generate login URLs for all injectors when they load
  useEffect(() => {
    if (injectors.length > 0) {
      const generateUrls = async () => {
        const urlMap = new Map<string, string>();
        await Promise.all(
          injectors.map(async (injector) => {
            try {
              const url = await generateUrl.mutateAsync(injector.id);
              urlMap.set(injector.id.toString(), url);
            } catch (error) {
              console.error(
                `Failed to generate URL for injector ${injector.id}`,
                error
              );
            }
          })
        );
        setLoginUrls(urlMap);
      };
      generateUrls();
    }
  }, [injectors]);

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
            Manage registered game injectors and their login URLs
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
            Manage registered game injectors and their login URLs
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
                    <TableHead>Redirect URL</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Generated Login URL</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {injectors.map((injector) => {
                    const loginUrl = loginUrls.get(injector.id.toString());
                    return (
                      <TableRow key={injector.id.toString()}>
                        <TableCell className="font-medium">
                          {injector.name}
                        </TableCell>
                        <TableCell>
                          {injector.redirectUrl ? (
                            <a
                              href={injector.redirectUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline flex items-center gap-1 text-sm"
                            >
                              {injector.redirectUrl.length > 40
                                ? `${injector.redirectUrl.substring(0, 40)}...`
                                : injector.redirectUrl}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              Not set
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatTimestamp(injector.created)}
                        </TableCell>
                        <TableCell>
                          {loginUrl ? (
                            <div className="flex items-center gap-2">
                              <code className="px-2 py-1 bg-muted font-mono text-xs max-w-xs truncate">
                                {loginUrl}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(loginUrl)}
                                className="h-7 w-7 p-0 shrink-0"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-right">
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
              This will permanently delete "{confirmDialog.injector?.name}" and
              invalidate its login URL. This action cannot be undone.
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
