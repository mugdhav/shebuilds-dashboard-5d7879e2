import { motion } from "framer-motion";
import { Rocket } from "lucide-react";
import type { Participant } from "@/types/hackathon";

interface BuilderSpotlightProps {
  builder: Participant | null;
}

export function BuilderSpotlight({ builder }: BuilderSpotlightProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="h-full"
      data-testid="builder-spotlight"
    >
      <div className="relative rounded-xl bg-black/30 backdrop-blur-md border border-white/20 p-5 h-full">
        <div className="flex items-center gap-2 mb-5">
          <Rocket className="w-4 h-4 text-orange-400" />
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-widest">
            Builder Spotlight
          </h3>
        </div>
        {builder ? (
          <div className="flex items-start gap-4">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg shrink-0"
              style={{ backgroundColor: builder.avatar_color }}
            >
              {builder.avatar_initials}
            </div>
            <div className="min-w-0">
              <h4 className="text-lg font-bold text-white truncate">{builder.name}</h4>
              {builder.project_name && (
                <p className="text-sm font-semibold text-orange-300">{builder.project_name}</p>
              )}
              {builder.project_description && (
                <p className="text-xs text-white/50 mt-1.5 italic line-clamp-3">
                  &ldquo;{builder.project_description}&rdquo;
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-white/30 italic">No builder spotlighted yet</p>
        )}
      </div>
    </motion.div>
  );
}
