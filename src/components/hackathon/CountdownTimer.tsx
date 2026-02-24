import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Timer, Clock } from "lucide-react";

interface CountdownTimerProps {
  startTime: string | null;
  endTime: string | null;
  delay?: number;
}

type TimerState = "waiting" | "running" | "ended";

export function CountdownTimer({ startTime, endTime, delay = 0.15 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0 });
  const [startsIn, setStartsIn] = useState({ hours: 0, minutes: 0 });
  const [state, setState] = useState<TimerState>("waiting");

  useEffect(() => {
    const update = () => {
      const now = new Date().getTime();
      const start = startTime ? new Date(startTime).getTime() : now;
      const end = endTime
        ? new Date(endTime).getTime()
        : start + 3 * 60 * 60 * 1000;

      if (now < start) {
        const diff = start - now;
        setState("waiting");
        setStartsIn({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      } else if (now < end) {
        const diff = end - now;
        setState("running");
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        });
      } else {
        setState("ended");
        setTimeLeft({ hours: 0, minutes: 0 });
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, endTime]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="relative"
      data-testid="countdown-timer"
    >
      <div className="absolute inset-0 rounded-xl bg-black/30 backdrop-blur-md border border-white/20" />
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
            {state === "waiting" ? (
              <Clock className="w-5 h-5 text-amber-400" />
            ) : (
              <Timer className="w-5 h-5 text-blue-400" />
            )}
          </div>
        </div>

        {state === "waiting" && (
          <>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-amber-400 tabular-nums">{startsIn.hours}</span>
              <span className="text-xl text-amber-400/60 font-light">h</span>
              <span className="text-4xl font-bold text-amber-400 tabular-nums ml-1">{startsIn.minutes}</span>
              <span className="text-xl text-amber-400/60 font-light">m</span>
            </div>
            <div className="text-xs text-white/50 font-medium uppercase tracking-widest">Starts In</div>
          </>
        )}

        {state === "running" && (
          <>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-cyan-400 tabular-nums">{timeLeft.hours}</span>
              <span className="text-xl text-cyan-400/60 font-light">h</span>
              <span className="text-4xl font-bold text-cyan-400 tabular-nums ml-1">{timeLeft.minutes}</span>
              <span className="text-xl text-cyan-400/60 font-light">m</span>
            </div>
            <div className="text-xs text-white/50 font-medium uppercase tracking-widest">Time Remaining</div>
          </>
        )}

        {state === "ended" && (
          <>
            <div className="flex items-baseline gap-1 mb-1">
              <span className="text-4xl font-bold text-white/30 tabular-nums">0</span>
              <span className="text-xl text-white/20 font-light">h</span>
              <span className="text-4xl font-bold text-white/30 tabular-nums ml-1">0</span>
              <span className="text-xl text-white/20 font-light">m</span>
            </div>
            <div className="text-xs text-white/30 font-medium uppercase tracking-widest">Hackathon Ended</div>
          </>
        )}
      </div>
    </motion.div>
  );
}
