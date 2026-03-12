import { useGetAllKeys } from "@/hooks/useQueries";

export function KeyStatsChart() {
  const { data: keys = [], isLoading } = useGetAllKeys();

  const total = keys.length;
  const active = keys.filter((k) => !k.blocked).length;
  const blocked = keys.filter((k) => k.blocked).length;

  const size = 120;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const activeRatio = total > 0 ? active / total : 0;
  const blockedRatio = total > 0 ? blocked / total : 0;

  const activeDash = circumference * activeRatio;
  const blockedDash = circumference * blockedRatio;
  const blockedOffset = -activeDash;

  const maxVal = Math.max(active, blocked, total, 1);

  return (
    <div
      className="rounded-2xl border border-white/5 p-5"
      style={{ background: "#111827" }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-xs font-bold text-gray-300 uppercase tracking-widest">
            Key Statistics
          </span>
        </div>
        <span className="text-xs font-mono text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2 py-0.5">
          LIVE
        </span>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <div className="w-20 h-20 rounded-full border-4 border-white/10 border-t-purple-500 animate-spin" />
        </div>
      ) : (
        <div className="flex items-center gap-6">
          {/* Donut */}
          <div
            className="relative shrink-0"
            aria-label="Key statistics donut chart"
          >
            <svg
              width={size}
              height={size}
              className="-rotate-90"
              role="img"
              aria-label="Donut chart showing key statistics"
            >
              <title>Key Statistics Chart</title>
              <circle
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={strokeWidth}
              />
              {activeRatio > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${activeDash} ${circumference - activeDash}`}
                  strokeDashoffset={0}
                  strokeLinecap="round"
                />
              )}
              {blockedRatio > 0 && (
                <circle
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="none"
                  stroke="#fb7185"
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${blockedDash} ${circumference - blockedDash}`}
                  strokeDashoffset={blockedOffset}
                  strokeLinecap="round"
                />
              )}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold font-mono text-white">
                {total}
              </span>
              <span className="text-xs text-gray-500">TOTAL</span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-gray-400">Active</span>
                </div>
                <span className="text-xs font-mono text-white">{active}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-green-500 transition-all duration-700"
                  style={{ width: `${(active / maxVal) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <span className="text-xs text-gray-400">Blocked</span>
                </div>
                <span className="text-xs font-mono text-white">{blocked}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-rose-400 to-red-500 transition-all duration-700"
                  style={{ width: `${(blocked / maxVal) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span className="text-xs text-gray-400">Total</span>
                </div>
                <span className="text-xs font-mono text-white">{total}</span>
              </div>
              <div className="h-1 rounded-full bg-white/5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-700"
                  style={{ width: `${(total / maxVal) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
