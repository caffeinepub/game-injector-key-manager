import { useState } from "react";
import { useCreateInjector } from "@/hooks/useQueries";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AddInjectorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const createInjector = useCreateInjector();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setName("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter an injector name");
      return;
    }

    try {
      await createInjector.mutateAsync({
        name: name.trim(),
        redirectUrl: null,
      });
      toast.success("Injector added successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to add injector");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add Injector
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Injector</DialogTitle>
            <DialogDescription>
              Enter the injector name to register it to your dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-6">
            {/* Injector Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Injector Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., PUBG Mobile Injector"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createInjector.isPending}>
              {createInjector.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createInjector.isPending ? "Adding..." : "Add Injector"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
