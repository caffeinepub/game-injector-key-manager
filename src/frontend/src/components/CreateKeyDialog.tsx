import { useState } from "react";
import { useCreateKey, useGetAllInjectors } from "@/hooks/useQueries";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import type { InjectorId } from "../backend";

const DURATION_PRESETS = [
  { label: "1 Hour", seconds: BigInt(3600) },
  { label: "6 Hours", seconds: BigInt(21600) },
  { label: "24 Hours", seconds: BigInt(86400) },
  { label: "7 Days", seconds: BigInt(604800) },
  { label: "30 Days", seconds: BigInt(2592000) },
  { label: "Permanent", seconds: BigInt(0) },
];

function generateRandomKey(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 24; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function CreateKeyDialog() {
  const [open, setOpen] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<bigint>(
    BigInt(86400)
  );
  const [selectedInjector, setSelectedInjector] = useState<InjectorId | null>(
    null
  );
  const createKey = useCreateKey();
  const { data: injectors = [], isLoading: injectorsLoading } =
    useGetAllInjectors();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setKeyValue(generateRandomKey());
      setSelectedDuration(BigInt(86400));
      setSelectedInjector(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyValue.trim()) {
      toast.error("Please enter a key value");
      return;
    }

    try {
      await createKey.mutateAsync({
        keyValue: keyValue.trim(),
        expiresInSeconds: selectedDuration,
        injectorId: selectedInjector,
      });
      toast.success("Key created successfully");
      setOpen(false);
    } catch (error) {
      toast.error("Failed to create key");
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Key
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Login Key</DialogTitle>
            <DialogDescription>
              Generate a new authentication key with custom duration.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="keyValue">Key Value</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setKeyValue(generateRandomKey())}
                  className="h-8 gap-2"
                >
                  <Wand2 className="h-3 w-3" />
                  Regenerate
                </Button>
              </div>
              <Input
                id="keyValue"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="Enter key value"
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="injector">Injector (Optional)</Label>
              <Select
                value={selectedInjector?.toString() || "general"}
                onValueChange={(value) =>
                  setSelectedInjector(
                    value === "general" ? null : BigInt(value)
                  )
                }
              >
                <SelectTrigger id="injector">
                  <SelectValue placeholder="Select an injector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General / No Injector</SelectItem>
                  {injectorsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading injectors...
                    </SelectItem>
                  ) : (
                    injectors.map((injector) => (
                      <SelectItem
                        key={injector.id.toString()}
                        value={injector.id.toString()}
                      >
                        {injector.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Keys without an injector can be used for any injector
              </p>
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <div className="grid grid-cols-3 gap-2">
                {DURATION_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={
                      selectedDuration === preset.seconds
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setSelectedDuration(preset.seconds)}
                    className="h-auto py-3"
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
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
            <Button type="submit" disabled={createKey.isPending}>
              {createKey.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {createKey.isPending ? "Creating..." : "Create Key"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
