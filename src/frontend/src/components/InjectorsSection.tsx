import { useMemo } from "react";
import { AddInjectorDialog } from "./AddInjectorDialog";
import { InjectorsTable } from "./InjectorsTable";
import { useGetAllKeys } from "@/hooks/useQueries";
import type { InjectorId } from "../backend";
import { toast } from "sonner";

function formatTimestampCSV(timestamp?: bigint): string {
  if (!timestamp || timestamp === BigInt(0)) {
    return "Never";
  }
  const ms = Number(timestamp) / 1_000_000;
  return new Date(ms).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InjectorsSection() {
  const { data: allKeys = [] } = useGetAllKeys();

  // Compute key counts per injector
  const keyCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const key of allKeys) {
      if (key.injector !== undefined) {
        const id = key.injector.toString();
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
    }
    return counts;
  }, [allKeys]);

  const handleExportKeys = (injectorId: InjectorId, injectorName: string) => {
    const injectorKeys = allKeys.filter(
      (k) => k.injector !== undefined && k.injector.toString() === injectorId.toString()
    );

    if (injectorKeys.length === 0) {
      toast.info(`No keys found for ${injectorName}`);
      return;
    }

    const headers = ["Key", "Injector", "Created", "Expires", "Status", "Max Devices", "Devices Used"];
    const rows = injectorKeys.map((k) => [
      k.key,
      injectorName,
      formatTimestampCSV(k.created),
      formatTimestampCSV(k.expires),
      k.blocked ? "Blocked" : "Active",
      k.maxDevices !== undefined ? k.maxDevices.toString() : "Unlimited",
      k.devicesUsed.toString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${injectorName.replace(/\s+/g, "_")}_keys.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(`Exported ${injectorKeys.length} keys for ${injectorName}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Injector Management</h2>
          <p className="text-muted-foreground">
            Register game injectors and manage key assignments
          </p>
        </div>
        <AddInjectorDialog />
      </div>
      <InjectorsTable keyCounts={keyCounts} onExportKeys={handleExportKeys} />
    </div>
  );
}
