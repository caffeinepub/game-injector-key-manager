import { useGetAllKeys } from "@/hooks/useQueries";
import { Key, Lock, Smartphone, Unlock } from "lucide-react";

interface StatCardProps {
  value: number;
  sublabel: string;
  accentColor: string;
  bgColor: string;
  icon: React.ReactNode;
  tag: string;
  tagColor: string;
}

function StatCard({
  value,
  sublabel,
  accentColor,
  bgColor,
  icon,
  tag,
  tagColor,
}: StatCardProps) {
  return (
    <div
      className="relative rounded-2xl border border-white/5 p-5 overflow-hidden"
      style={{ background: "#111827" }}
    >
      <div
        className={`absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl ${accentColor}`}
      />
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${bgColor}`}
        >
          {icon}
        </div>
        <span
          className={`text-xs font-bold font-mono tracking-widest ${tagColor}`}
        >
          {tag}
        </span>
      </div>
      <div className="text-4xl font-bold font-mono text-white mb-1">
        {value}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wider">
        {sublabel}
      </div>
    </div>
  );
}

export function StatsCards() {
  const { data: keys = [], isLoading } = useGetAllKeys();

  const totalKeys = keys.length;
  const activeKeys = keys.filter((key) => !key.blocked).length;
  const blockedKeys = keys.filter((key) => key.blocked).length;
  const keysAtCapacity = keys.filter(
    (key) => key.maxDevices && key.deviceCount >= key.maxDevices,
  ).length;

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-white/5 p-5 animate-pulse"
            style={{ background: "#111827" }}
          >
            <div className="h-8 bg-white/5 rounded-xl mb-3" />
            <div className="h-10 bg-white/5 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-4 mb-6">
      <StatCard
        value={totalKeys}
        sublabel="Total Keys"
        accentColor="bg-gradient-to-r from-cyan-400 to-cyan-600"
        bgColor="bg-cyan-500/15"
        icon={<Key className="h-4 w-4 text-cyan-400" />}
        tag="KEYS"
        tagColor="text-cyan-400"
      />
      <StatCard
        value={activeKeys}
        sublabel="Active Keys"
        accentColor="bg-gradient-to-r from-emerald-400 to-green-500"
        bgColor="bg-emerald-500/15"
        icon={<Unlock className="h-4 w-4 text-emerald-400" />}
        tag="ACT"
        tagColor="text-emerald-400"
      />
      <StatCard
        value={blockedKeys}
        sublabel="Blocked Keys"
        accentColor="bg-gradient-to-r from-rose-400 to-red-500"
        bgColor="bg-rose-500/15"
        icon={<Lock className="h-4 w-4 text-rose-400" />}
        tag="IDLE"
        tagColor="text-rose-400"
      />
      <StatCard
        value={keysAtCapacity}
        sublabel="At Capacity"
        accentColor="bg-gradient-to-r from-amber-400 to-orange-500"
        bgColor="bg-amber-500/15"
        icon={<Smartphone className="h-4 w-4 text-amber-400" />}
        tag="CAP"
        tagColor="text-amber-400"
      />
    </div>
  );
}
