import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StatCardProps {
  value: number;
  label: string;
  icon?: ReactNode;
  iconBg?: string;
  delay?: number;
}

export function StatCard({ value, label, icon, iconBg = "bg-purple-500/20", delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative group"
      data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <div className="absolute inset-0 rounded-xl bg-black/30 backdrop-blur-md border border-white/20" />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          {icon ? (
            <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
              {icon}
            </div>
          ) : <div />}
          <div className="w-2 h-2 bg-cyan-400/50 rounded-full mt-1" />
        </div>
        <div className="text-4xl font-bold text-cyan-400 mb-1 tabular-nums">
          {value.toLocaleString()}
        </div>
        <div className="text-xs text-white/50 font-medium uppercase tracking-widest">{label}</div>
      </div>
    </motion.div>
  );
}
