import { useState } from "react";
import {
  useGetAllResellers,
  useCreateReseller,
  useDeleteReseller,
  useAddCredits,
  useGetKeyCreditCost,
  useSetKeyCreditCost,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Loader2, Trash2, Coins } from "lucide-react";
import { toast } from "sonner";
import type { Reseller, ResellerId } from "../backend";

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

export function ResellersSection() {
  const { data: resellers = [], isLoading } = useGetAllResellers();
  const { data: keyCreditCost = BigInt(1) } = useGetKeyCreditCost();
  const setKeyCreditCost = useSetKeyCreditCost();
  const createReseller = useCreateReseller();
  const deleteReseller = useDeleteReseller();
  const addCredits = useAddCredits();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [initialCredits, setInitialCredits] = useState("");

  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [selectedReseller, setSelectedReseller] = useState<Reseller | null>(null);
  const [creditsAmount, setCreditsAmount] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resellerToDelete, setResellerToDelete] = useState<Reseller | null>(null);

  const [costDialogOpen, setCostDialogOpen] = useState(false);
  const [newCreditCost, setNewCreditCost] = useState("");

  const handleCreateReseller = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Username and password are required");
      return;
    }

    const credits = initialCredits ? BigInt(parseInt(initialCredits)) : BigInt(0);

    try {
      await createReseller.mutateAsync({
        username: newUsername.trim(),
        password: newPassword.trim(),
        initialCredits: credits,
      });
      toast.success("Reseller created successfully");
      setCreateDialogOpen(false);
      setNewUsername("");
      setNewPassword("");
      setInitialCredits("");
    } catch (error: any) {
      toast.error(error.message || "Failed to create reseller");
      console.error(error);
    }
  };

  const handleAddCredits = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedReseller || !creditsAmount) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amount = BigInt(parseInt(creditsAmount));
    if (amount <= BigInt(0)) {
      toast.error("Amount must be greater than 0");
      return;
    }

    try {
      await addCredits.mutateAsync({
        resellerId: selectedReseller.id,
        amount,
      });
      toast.success(`Added ${creditsAmount} credits to ${selectedReseller.username}`);
      setCreditsDialogOpen(false);
      setSelectedReseller(null);
      setCreditsAmount("");
    } catch (error: any) {
      toast.error(error.message || "Failed to add credits");
      console.error(error);
    }
  };

  const handleDeleteReseller = async () => {
    if (!resellerToDelete) return;

    try {
      await deleteReseller.mutateAsync(resellerToDelete.id);
      toast.success(`Reseller ${resellerToDelete.username} deleted successfully`);
      setDeleteDialogOpen(false);
      setResellerToDelete(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete reseller");
      console.error(error);
    }
  };

  const handleUpdateCreditCost = async (e: React.FormEvent) => {
    e.preventDefault();

    const cost = BigInt(parseInt(newCreditCost));
    if (cost <= BigInt(0)) {
      toast.error("Cost must be greater than 0");
      return;
    }

    try {
      await setKeyCreditCost.mutateAsync(cost);
      toast.success(`Credit cost per key updated to ${newCreditCost}`);
      setCostDialogOpen(false);
      setNewCreditCost("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update credit cost");
      console.error(error);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resellers</CardTitle>
          <CardDescription>Manage reseller accounts and credits</CardDescription>
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Reseller Management</h2>
          <p className="text-muted-foreground">
            Manage reseller accounts and credit allocations
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={costDialogOpen} onOpenChange={setCostDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Coins className="h-4 w-4" />
                Set Credit Cost ({keyCreditCost.toString()})
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleUpdateCreditCost}>
                <DialogHeader>
                  <DialogTitle>Set Credit Cost Per Key</DialogTitle>
                  <DialogDescription>
                    Define how many credits are required to create one key
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="creditCost">Credits Per Key</Label>
                    <Input
                      id="creditCost"
                      type="number"
                      min="1"
                      value={newCreditCost}
                      onChange={(e) => setNewCreditCost(e.target.value)}
                      placeholder={`Current: ${keyCreditCost.toString()}`}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCostDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={setKeyCreditCost.isPending}>
                    {setKeyCreditCost.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Update Cost
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Reseller
              </Button>
            </DialogTrigger>
            <DialogContent>
              <form onSubmit={handleCreateReseller}>
                <DialogHeader>
                  <DialogTitle>Create New Reseller</DialogTitle>
                  <DialogDescription>
                    Add a new reseller account with initial credits
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="Enter username"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credits">Initial Credits</Label>
                    <Input
                      id="credits"
                      type="number"
                      min="0"
                      value={initialCredits}
                      onChange={(e) => setInitialCredits(e.target.value)}
                      placeholder="0"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createReseller.isPending}>
                    {createReseller.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Reseller
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Resellers</CardTitle>
          <CardDescription>
            View and manage all reseller accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          {resellers.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No resellers created yet. Click "Add Reseller" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resellers.map((reseller) => (
                    <TableRow key={reseller.id.toString()}>
                      <TableCell className="font-mono text-xs">
                        {reseller.id.toString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        {reseller.username}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            reseller.credits > BigInt(0) ? "default" : "secondary"
                          }
                          className="gap-1 font-mono"
                        >
                          <Coins className="h-3 w-3" />
                          {reseller.credits.toString()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(reseller.created)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatTimestamp(reseller.lastLogin)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReseller(reseller);
                              setCreditsDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Coins className="h-3 w-3" />
                            Add Credits
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setResellerToDelete(reseller);
                              setDeleteDialogOpen(true);
                            }}
                            className="gap-2"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Credits Dialog */}
      <Dialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <DialogContent>
          <form onSubmit={handleAddCredits}>
            <DialogHeader>
              <DialogTitle>Add Credits</DialogTitle>
              <DialogDescription>
                Add credits to {selectedReseller?.username}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  value={creditsAmount}
                  onChange={(e) => setCreditsAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Current balance: {selectedReseller?.credits.toString() || "0"} credits
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreditsDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={addCredits.isPending}>
                {addCredits.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Credits
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reseller?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the reseller account for{" "}
              <span className="font-semibold">{resellerToDelete?.username}</span>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReseller}
              disabled={deleteReseller.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteReseller.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete Reseller
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
