import { useState } from "react";
import { useResellerCreateKey, useGetAllInjectors } from "@/hooks/useQueries";
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
import { Plus, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import type { InjectorId, ResellerId } from "../backend";

const DURATION_PRESETS = [
  { label: "1 Hour", seconds: BigInt(3600) },
  { label: "6 Hours", seconds: BigInt(21600) },
  { label: "24 Hours", seconds: BigInt(86400) },
  { label: "7 Days", seconds: BigInt(604800) },
  { label: "30 Days", seconds: BigInt(2592000) },
  { label: "Permanent", seconds: BigInt(0) },
];

const DEVICE_LIMIT_PRESETS = [
  { label: "1", value: 1 },
  { label: "3", value: 3 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "Unlimited", value: null },
];

function generateGauravKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "GAURAV-";
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

interface CreateKeyDialogResellerProps {
  resellerId: ResellerId;
  currentCredits: bigint;
  creditCost: bigint;
}

export function CreateKeyDialogReseller({
  resellerId,
  currentCredits,
  creditCost,
}: CreateKeyDialogResellerProps) {
  const [open, setOpen] = useState(false);
  const [keyValue, setKeyValue] = useState("");
  const [selectedDuration, setSelectedDuration] = useState<bigint>(
    BigInt(86400)
  );
  const [selectedInjector, setSelectedInjector] = useState<InjectorId | null>(
    null
  );
  const [maxDevices, setMaxDevices] = useState<number | null>(null);
  const createKey = useResellerCreateKey();
  const { data: injectors = [], isLoading: injectorsLoading } =
    useGetAllInjectors();

  const canAfford = currentCredits >= creditCost;

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setKeyValue(generateGauravKey());
      setSelectedDuration(BigInt(86400));
      setSelectedInjector(null);
      setMaxDevices(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!keyValue.trim()) {
      toast.error("Please enter a key value");
      return;
    }

    if (!canAfford) {
      toast.error(`Insufficient credits. You need ${creditCost.toString()} credits.`);
      return;
    }

    if (selectedInjector === null) {
      toast.error("Please select an injector");
      return;
    }

    try {
      await createKey.mutateAsync({
        resellerId,
        keyValue: keyValue.trim(),
        expiresInSeconds: selectedDuration,
        injectorId: selectedInjector,
        maxDevices: maxDevices !== null ? BigInt(maxDevices) : undefined,
      });
      toast.success(`Key created successfully. ${creditCost.toString()} credits deducted.`);
      setOpen(false);
    } catch (error: any) {
      if (error.message?.includes("Insufficient credits")) {
        toast.error("Insufficient credits. Please contact admin for more credits.");
      } else if (error.message?.includes("already exists")) {
        toast.error("This key already exists. Please use a different key.");
      } else {
        toast.error(error.message || "Failed to create key");
      }
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2" disabled={!canAfford}>
          <Plus className="h-4 w-4" />
          Create Key ({creditCost.toString()} credits)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Login Key</DialogTitle>
            <DialogDescription>
              Generate a new authentication key. This will cost {creditCost.toString()} credits.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* Credit Warning */}
            {!canAfford && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Insufficient credits. You have {currentCredits.toString()} but need{" "}
                  {creditCost.toString()}.
                </span>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="keyValue">Key Value</Label>
              <Input
                id="keyValue"
                value={keyValue}
                onChange={(e) => setKeyValue(e.target.value)}
                placeholder="Auto-generated key (GAURAV-XXXXX)"
                className="font-mono"
                disabled
              />
              <p className="text-xs text-muted-foreground">
                Keys are automatically generated with GAURAV- prefix
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="injector">
                Injector (Required) <span className="text-destructive">*</span>
              </Label>
              <Select
                value={selectedInjector?.toString() ?? ""}
                onValueChange={(value) =>
                  setSelectedInjector(value ? BigInt(value) : null)
                }
              >
                <SelectTrigger id="injector">
                  <SelectValue placeholder="Select an injector" />
                </SelectTrigger>
                <SelectContent>
                  {injectorsLoading ? (
                    <SelectItem value="loading" disabled>
                      Loading injectors...
                    </SelectItem>
                  ) : injectors.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No injectors available
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
                Keys are bound to the selected injector and will only work with it
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

            <div className="space-y-2">
              <Label>Max Devices (Optional)</Label>
              <div className="grid grid-cols-5 gap-2">
                {DEVICE_LIMIT_PRESETS.map((preset) => (
                  <Button
                    key={preset.label}
                    type="button"
                    variant={
                      maxDevices === preset.value ? "default" : "outline"
                    }
                    onClick={() => setMaxDevices(preset.value)}
                    className="h-auto py-3 gap-1"
                  >
                    {preset.value === null && (
                      <span className="text-xs">∞</span>
                    )}
                    {preset.label}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Limit how many devices can use this key. When limit is reached,
                new devices will be blocked.
              </p>
            </div>

            {/* Cost Display */}
            <div className="p-3 bg-primary/10 border border-primary/20 rounded text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">Cost:</span>
                <span className="font-bold text-lg">
                  {creditCost.toString()} credits
                </span>
              </div>
              <div className="flex items-center justify-between mt-1 text-muted-foreground">
                <span>Remaining after:</span>
                <span>
                  {(currentCredits - creditCost).toString()} credits
                </span>
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
            <Button type="submit" disabled={createKey.isPending || !canAfford}>
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
