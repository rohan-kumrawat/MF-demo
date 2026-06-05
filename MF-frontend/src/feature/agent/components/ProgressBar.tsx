// src/feature/agent/components/ProgressBar.tsx
import React from "react";
import { formatRupee } from "../../../data/demoData";

interface Props {
  collected: number;
  target: number;
}

export const ProgressBar = React.memo(function ProgressBar({
  collected,
  target,
}: Props) {
  const percentage =
    target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

  return (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
      <div className="flex justify-between items-end mb-3">
        <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Today's Progress
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-gray-900">
              {formatRupee(collected)}
            </span>
            <span className="text-xs text-gray-500 font-medium">
              / {formatRupee(target)}
            </span>
          </div>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-primary">
            {percentage}%
          </span>
        </div>
      </div>

      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full gradient-primary transition-all duration-1000 ease-out rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {percentage >= 100 ? (
        <p className="text-[10px] text-green-600 font-bold mt-2 flex items-center gap-1">
          ✨ Target Achieved! Great job.
        </p>
      ) : (
        <p className="text-[10px] text-gray-400 font-medium mt-2">
          Keep going! You are {formatRupee(target - collected)} away from
          target.
        </p>
      )}
    </div>
  );
});
