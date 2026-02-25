import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Lock, Unlock, Smartphone, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { LoginKey } from "../backend";

interface KeyDetailsModalProps {
  keyData: LoginKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete?: () => void;
  onBlockUnblock?: () => void;
  showBlockUnblock?: boolean;
  isDeleting?: boolean;
  isBlockingUnblocking?: boolean;
  getInjectorName: (injectorId?: bigint) => string;
  getDeviceUsageDisplay: (key: LoginKey) => {
    text: string;
    variant: "default" | "secondary" | "destructive";
  };
  formatTimestamp: (timestamp?: bigint) => string;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  toast.success("Key copied to clipboard");
}

export function KeyDetailsModal({
  keyData,
  open,
  onOpenChange,
  onDelete,
  onBlockUnblock,
  showBlockUnblock = false,
  isDeleting = false,
  isBlockingUnblocking = false,
  getInjectorName,
  getDeviceUsageDisplay,
  formatTimestamp,
}: KeyDetailsModalProps) {
  if (!keyData) return null;

  const deviceUsage = getDeviceUsageDisplay(keyData);
  const isAtLimit = keyData.maxDevices && keyData.deviceCount >= keyData.maxDevices;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Key Details</DialogTitle>
          <DialogDescription>
            Complete information for this login key
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* ID */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">ID:</span>
            <span className="col-span-2 font-mono text-sm text-muted-foreground">
              {keyData.id.toString()}
            </span>
          </div>

          {/* Key Value */}
          <div className="grid grid-cols-3 items-start gap-4">
            <span className="font-semibold text-sm">Key Value:</span>
            <div className="col-span-2 flex items-center gap-2">
              <code className="px-3 py-2 bg-muted font-mono text-xs rounded-md break-all flex-1">
                {keyData.key}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(keyData.key)}
                className="h-8 w-8 p-0 shrink-0"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Injector */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">Injector:</span>
            <div className="col-span-2">
              <Badge variant="outline" className="font-medium">
                {getInjectorName(keyData.injector)}
              </Badge>
            </div>
          </div>

          {/* Created */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">Created:</span>
            <span className="col-span-2 text-sm text-muted-foreground">
              {formatTimestamp(keyData.created)}
            </span>
          </div>

          {/* Expires */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">Expires:</span>
            <span className="col-span-2 text-sm text-muted-foreground">
              {formatTimestamp(keyData.expires)}
            </span>
          </div>

          {/* Devices */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">Devices:</span>
            <div className="col-span-2">
              <Badge variant={deviceUsage.variant} className="gap-1 font-mono">
                <Smartphone className="h-3 w-3" />
                {deviceUsage.text}
                {isAtLimit && " (Limit Reached)"}
              </Badge>
            </div>
          </div>

          {/* Status */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">Status:</span>
            <div className="col-span-2">
              {keyData.blocked ? (
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
            </div>
          </div>

          {/* Used Count */}
          <div className="grid grid-cols-3 items-center gap-4">
            <span className="font-semibold text-sm">Used:</span>
            <span className="col-span-2 font-mono text-sm text-muted-foreground">
              {keyData.used.toString()}
            </span>
          </div>
        </div>

        <DialogFooter className="gap-2">
          {/* Block/Unblock Button (Admin only) */}
          {showBlockUnblock && onBlockUnblock && (
            <Button
              variant={keyData.blocked ? "outline" : "destructive"}
              onClick={onBlockUnblock}
              disabled={isBlockingUnblocking}
              className="gap-2"
            >
              {isBlockingUnblocking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : keyData.blocked ? (
                <Unlock className="h-4 w-4" />
              ) : (
                <Lock className="h-4 w-4" />
              )}
              {keyData.blocked ? "Unblock" : "Block"}
            </Button>
          )}

          {/* Delete Button */}
          {onDelete && (
            <Button
              variant="destructive"
              onClick={onDelete}
              disabled={isDeleting}
              className="gap-2"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
