import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGetPanelSettings, useUpdatePanelSettings } from "@/hooks/useQueries";
import { toast } from "sonner";
import { Loader2, Type, Palette } from "lucide-react";

const themePresets = [
  {
    value: "default",
    label: "Default Dark",
    description: "Cyberpunk industrial theme",
  },
  {
    value: "light",
    label: "Light",
    description: "Clean white background",
  },
  {
    value: "blue",
    label: "Blue Ocean",
    description: "Deep blue tones",
  },
  {
    value: "purple",
    label: "Purple Mystic",
    description: "Mystic dark purple",
  },
  {
    value: "green",
    label: "Green Matrix",
    description: "Terminal-inspired green",
  },
];

interface SettingsSectionProps {
  onPanelNameChange?: (name: string) => void;
}

export function SettingsSection({ onPanelNameChange }: SettingsSectionProps) {
  const { data: panelSettings, isLoading: isLoadingSettings } =
    useGetPanelSettings();
  const updateSettings = useUpdatePanelSettings();

  const [panelName, setPanelName] = useState("");
  const [selectedTheme, setSelectedTheme] = useState("default");

  // Initialize from loaded settings
  useEffect(() => {
    if (panelSettings) {
      setPanelName(panelSettings.panelName);
      setSelectedTheme(panelSettings.themePreset);
    }
  }, [panelSettings]);

  // Apply theme immediately when changed
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-theme", selectedTheme);

    // Also maintain dark class for ThemeToggle compatibility
    if (selectedTheme === "light") {
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
    }
  }, [selectedTheme]);

  const handleSave = async () => {
    if (!panelName.trim()) {
      toast.error("Panel name cannot be empty");
      return;
    }

    try {
      await updateSettings.mutateAsync({
        panelName: panelName.trim(),
        themePreset: selectedTheme,
      });

      // Notify parent component of panel name change
      if (onPanelNameChange) {
        onPanelNameChange(panelName.trim());
      }

      toast.success("Settings saved successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    }
  };

  const handleReset = () => {
    if (panelSettings) {
      setPanelName(panelSettings.panelName);
      setSelectedTheme(panelSettings.themePreset);
      toast.info("Reset to current saved settings");
    }
  };

  if (isLoadingSettings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold mb-2">Panel Settings</h2>
        <p className="text-muted-foreground">
          Customize your dashboard name and visual theme
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Panel Name Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Panel Name
            </CardTitle>
            <CardDescription>
              The name displayed in the dashboard header
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="panelName">Dashboard Title</Label>
              <Input
                id="panelName"
                value={panelName}
                onChange={(e) => setPanelName(e.target.value)}
                placeholder="Enter panel name"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                {panelName.length}/50 characters
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Theme Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Theme Preset
            </CardTitle>
            <CardDescription>
              Choose a color scheme for your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Color Theme</Label>
              <Select value={selectedTheme} onValueChange={setSelectedTheme}>
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themePresets.map((preset) => (
                    <SelectItem key={preset.value} value={preset.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{preset.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {preset.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={updateSettings.isPending}
            >
              Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="gap-2"
            >
              {updateSettings.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
