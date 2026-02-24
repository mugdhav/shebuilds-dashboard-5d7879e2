import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import type { Topic } from "@/types/hackathon";

interface TopicCloudProps {
  topics: Topic[];
}

const WORD_COLORS = [
  "text-cyan-300",
  "text-teal-300",
  "text-blue-300",
  "text-purple-300",
  "text-pink-300",
  "text-orange-300",
  "text-green-300",
  "text-white",
  "text-yellow-300",
  "text-rose-300",
];

export function TopicCloud({ topics }: TopicCloudProps) {
  const maxWeight = Math.max(...topics.map((t) => t.weight), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="h-full"
      data-testid="topic-cloud"
    >
      <div className="relative rounded-xl bg-black/30 backdrop-blur-md border border-white/20 p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-white/60" />
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-widest">
            Trending Topics
          </h3>
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-2 items-center">
          {topics.map((topic, i) => {
            const scale = 0.75 + (topic.weight / maxWeight) * 0.65;
            const colorClass = WORD_COLORS[i % WORD_COLORS.length];

            return (
              <motion.span
                key={topic.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.03 }}
                className={`${colorClass} font-semibold cursor-default leading-tight`}
                style={{ fontSize: `${scale}rem` }}
                data-testid={`topic-tag-${topic.id}`}
              >
                {topic.name}
              </motion.span>
            );
          })}
          {topics.length === 0 && (
            <p className="text-sm text-white/40 py-2">No topics yet...</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
