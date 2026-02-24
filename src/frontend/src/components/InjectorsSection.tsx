import { AddInjectorDialog } from "./AddInjectorDialog";
import { InjectorsTable } from "./InjectorsTable";

export function InjectorsSection() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Injector Management</h2>
          <p className="text-muted-foreground">
            Register game injectors and redirect their login servers to your
            dashboard
          </p>
        </div>
        <AddInjectorDialog />
      </div>
      <InjectorsTable />
    </div>
  );
}
