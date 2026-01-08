// Research-backed Worker Quality Table
// This logic is inspired by SPC and quality management methods described in smart manufacturing research literature.
import React, { useEffect, useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { StatCard } from "@/components/ui/stat-card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { apiFetch } from "@/lib/api";

interface WorkerQuality {
  worker_id: string;
  worker_name?: string;
  avg_qc_score: number;
  defects_per_1000_units: number;
  rework_rate: number;
  avg_cycle_time_days: number;
  wqpi: number;
  rank: number;
}

const getColor = (rank: number, total: number) => {
  if (rank <= Math.ceil(total * 0.25)) return "bg-success/10 text-success";
  if (rank > Math.ceil(total * 0.75)) return "bg-destructive/10 text-destructive";
  return "bg-warning/10 text-warning";
};

export const WorkerQualityTable: React.FC<{ month?: string }> = ({ month }) => {
  const [data, setData] = useState<WorkerQuality[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiFetch(`/qc/workers/performance?month=${month || new Date().toISOString().slice(0,7)}`)
      .then(setData)
      .finally(() => setLoading(false));
  }, [month]);

  if (loading) return <GlassCard>Loading worker quality data...</GlassCard>;
  if (!data.length) return <GlassCard>No worker quality data found.</GlassCard>;

  return (
    <GlassCard className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Worker Quality Comparison</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/30 text-muted-foreground">
              <th className="py-2 font-medium">Rank</th>
              <th className="py-2 font-medium">Worker</th>
              <th className="py-2 font-medium">Avg QC Score</th>
              <th className="py-2 font-medium">Defects/1000</th>
              <th className="py-2 font-medium">Rework Rate</th>
              <th className="py-2 font-medium">Avg Cycle Time</th>
              <th className="py-2 font-medium">WQPI</th>
              <th className="py-2 font-medium">Progress</th>
            </tr>
          </thead>
          <tbody>
            {data.map((w, i) => (
              <tr key={w.worker_id} className={cn("border-b border-border/20 last:border-0", getColor(w.rank, data.length))}>
                <td className="py-3 font-bold text-center">{w.rank}</td>
                <td className="py-3 font-mono">{w.worker_name || w.worker_id}</td>
                <td className="py-3 text-center">{w.avg_qc_score.toFixed(1)}</td>
                <td className="py-3 text-center">{w.defects_per_1000_units.toFixed(2)}</td>
                <td className="py-3 text-center">{(w.rework_rate * 100).toFixed(1)}%</td>
                <td className="py-3 text-center">{w.avg_cycle_time_days.toFixed(2)}</td>
                <td className="py-3 text-center font-semibold">{w.wqpi.toFixed(2)}</td>
                <td className="py-3 min-w-[120px]">
                  <Progress value={Math.max(0, Math.min(100, (w.wqpi / data[0].wqpi) * 100))} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="text-xs text-muted-foreground mt-4">
        <p>Green: Top 25% | Yellow: Middle 50% | Red: Bottom 25%</p>
        <p className="mt-1">WQPI = avg_qc_score - (defects_per_1000_units × 0.3) - (rework_rate × 0.4) - (avg_cycle_time_days × 0.3)</p>
        <p className="mt-1 italic">This table uses research-backed worker benchmarking and SPC analytics.</p>
      </div>
    </GlassCard>
  );
};

export default WorkerQualityTable;
