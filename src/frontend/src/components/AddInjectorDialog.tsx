import { useState, useRef, useEffect } from "react";
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
import { Plus, Loader2, Upload, FileCode, Package, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";

interface ApkFileInfo {
  name: string;
  size: number;
  packageName: string;
}

export function AddInjectorDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [apkFile, setApkFile] = useState<ApkFileInfo | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createInjector = useCreateInjector();

  const handleOpen = (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      setName("");
      setRedirectUrl("");
      setApkFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const extractPackageName = (filename: string): string => {
    // Remove .apk extension
    const nameWithoutExt = filename.replace(/\.apk$/i, "");
    
    // If it looks like a package name (contains dots), return as-is
    if (nameWithoutExt.includes(".")) {
      return nameWithoutExt;
    }
    
    // Otherwise, create a package-like name
    return `com.injector.${nameWithoutExt.toLowerCase().replace(/\s+/g, "")}`;
  };

  const cleanInjectorName = (filename: string): string => {
    // Remove .apk extension
    let cleaned = filename.replace(/\.apk$/i, "");
    
    // If it's a package name, extract the last part
    if (cleaned.includes(".")) {
      const parts = cleaned.split(".");
      cleaned = parts[parts.length - 1];
    }
    
    // Capitalize and add spaces before capitals
    return cleaned
      .replace(/([A-Z])/g, " $1")
      .trim()
      .split(/[\s_-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".apk")) {
      toast.error("Please select a valid APK file");
      return;
    }

    const packageName = extractPackageName(file.name);
    const injectorName = cleanInjectorName(file.name);

    setApkFile({
      name: file.name,
      size: file.size,
      packageName,
    });

    // Auto-populate fields
    setName(injectorName);
    const autoRedirectUrl = `${window.location.origin}/auth/injector`;
    setRedirectUrl(autoRedirectUrl);

    toast.success("APK loaded and auto-configured");
  };

  const handleRemoveFile = () => {
    setApkFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("APK removed - you can enter details manually");
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
        redirectUrl: redirectUrl.trim() || null,
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
      <DialogContent className="sm:max-w-[600px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Injector</DialogTitle>
            <DialogDescription>
              Upload an APK file for auto-configuration or enter details manually.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-6">
            {/* APK File Upload Section */}
            <Card className="border-2 border-dashed border-border hover:border-primary/50 transition-colors">
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    {!apkFile ? (
                      <>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-sm font-semibold">
                            Upload APK File (Optional)
                          </Label>
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">
                          Select an injector APK from your device for automatic configuration
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".apk"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="apk-upload"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="gap-2"
                        >
                          <FileCode className="h-4 w-4" />
                          Choose APK File
                        </Button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded bg-success/10 flex items-center justify-center shrink-0 mt-0.5">
                              <FileCode className="h-5 w-5 text-success" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{apkFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(apkFile.size)}
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveFile}
                            className="h-8 w-8 p-0 shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground font-medium">Package:</span>
                            <code className="text-foreground font-mono">{apkFile.packageName}</code>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-success">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Auto-configuration applied</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>

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
              {apkFile && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Auto-populated from APK (editable)
                </p>
              )}
            </div>

            {/* Redirect URL */}
            <div className="space-y-2">
              <Label htmlFor="redirectUrl">Login Redirect URL</Label>
              <Input
                id="redirectUrl"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com/auth/callback"
                type="url"
              />
              {apkFile ? (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  Auto-configured to redirect to this website (editable)
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default redirect behavior
                </p>
              )}
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
