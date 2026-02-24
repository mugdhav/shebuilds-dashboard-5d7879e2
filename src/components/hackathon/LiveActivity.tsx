import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import type { Activity } from "@/types/hackathon";

interface LiveActivityProps {
  activities: Activity[];
}

function timeAgo(date: string | Date) {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin === 1) return "1m ago";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr === 1) return "1h ago";
  return `${diffHr}h ago`;
}

export function LiveActivity({ activities }: LiveActivityProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="h-full"
      data-testid="live-activity"
    >
      <div className="relative rounded-xl bg-black/30 backdrop-blur-md border border-white/20 p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-4 h-4 text-green-400" />
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-widest">
            Live Activity
          </h3>
        </div>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20">
          <AnimatePresence mode="popLayout">
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-3"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full shrink-0 mt-1.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-white/90">
                    <span className="font-semibold">{activity.participant_name}</span>{" "}
                    <span className="text-white/70">{activity.action}</span>
                    {activity.emoji && <span className="ml-1">{activity.emoji}</span>}
                  </p>
                  <p className="text-xs text-white/40 mt-0.5">
                    {timeAgo(activity.created_at)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {activities.length === 0 && (
            <p className="text-sm text-white/40 text-center py-4">
              No activity yet...
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
