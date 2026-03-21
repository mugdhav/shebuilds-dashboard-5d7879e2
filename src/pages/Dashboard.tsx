import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Users, CheckCircle2, Code2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GlowLogo } from "@/components/hackathon/GlowLogo";
import { StatCard } from "@/components/hackathon/StatCard";
import { CountdownTimer } from "@/components/hackathon/CountdownTimer";
import { BuilderSpotlight } from "@/components/hackathon/BuilderSpotlight";
import { LiveActivity } from "@/components/hackathon/LiveActivity";
import { TopicCloud } from "@/components/hackathon/TopicCloud";
import type { Participant, Activity, Topic, HackathonSettings } from "@/types/hackathon";

function useCurrentTime() {
  const [time, setTime] = useState(() => new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);
  return time;
}

async function fetchDashboardData() {
  const [settingsRes, spotlightRes, activitiesRes, topicsRes, submissionsRes] = await Promise.all([
    supabase.from("hackathon_settings").select("*").limit(1).single(),
    supabase.from("participants").select("*").eq("is_spotlight", true).limit(1).maybeSingle(),
    supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(15),
    supabase.from("topics").select("*"),
    supabase.from("submissions").select("email"),
  ]);

  const settings = settingsRes.data as HackathonSettings | null;
  const spotlight = spotlightRes.data as Participant | null;
  const activities = (activitiesRes.data || []) as Activity[];
  const topics = (topicsRes.data || []) as Topic[];
  const distinctSubmitters = new Set((submissionsRes.data || []).map((s: any) => s.email)).size;

  return {
    settings: settings ? { ...settings, completed_apps: distinctSubmitters } : settings,
    spotlight,
    activities,
    topics,
    isUsingDemoData: settings?.is_using_demo_data ?? true,
  };
}

export default function Dashboard() {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const currentTime = useCurrentTime();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
    refetchInterval: 10000,
  });

  // Subscribe to realtime changes
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "participants" }, () => {
        refetch();
        setLastUpdated(new Date());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "activities" }, () => {
        refetch();
        setLastUpdated(new Date());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "topics" }, () => {
        refetch();
        setLastUpdated(new Date());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "hackathon_settings" }, () => {
        refetch();
        setLastUpdated(new Date());
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "submissions" }, () => {
        refetch();
        setLastUpdated(new Date());
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const settings = data?.settings;
  const spotlight = data?.spotlight;
  const activities = data?.activities || [];
  const topics = data?.topics || [];
  const isUsingDemoData = data?.isUsingDemoData ?? true;

  const activeBuilders = settings?.active_participants || 0;
  const completedApps = settings?.completed_apps || 0;
  const inProgress = Math.max(0, activeBuilders - completedApps);

  const formatTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });

  const formatCurrentTime = (date: Date) =>
    date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }) + " IST";

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative" style={{ background: 'linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)' }}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-white/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-start justify-between mb-6"
        >
          <GlowLogo />

          <div className="flex flex-col items-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-none">
              Pune Edition
            </h1>
            <p className="text-white text-xs font-bold mt-1">{currentTime.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })} IST</p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open('/Help.html', '_blank')}
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2.5 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
              >
                Help
              </button>
              <div className="bg-black/30 border border-white/20 rounded-lg px-4 py-2.5 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-white font-medium">
                    Live - Updated {formatTime(lastUpdated)}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open('/admin', '_blank')}
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
              >
                Administrator
              </button>
              <button
                onClick={() => window.open('/submit', '_blank')}
                className="bg-black/30 border border-white/20 rounded-lg px-3 py-2 backdrop-blur-sm text-white/70 hover:text-white hover:bg-white/10 transition-colors text-xs font-medium"
              >
                Builder
              </button>
            </div>
          </div>
        </motion.header>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <StatCard
            value={activeBuilders}
            label="Active Builders"
            icon={<Users className="w-5 h-5 text-orange-400" />}
            iconBg="bg-orange-500/20"
            delay={0}
          />
          <StatCard
            value={completedApps}
            label="Completed Apps"
            icon={<CheckCircle2 className="w-5 h-5 text-teal-400" />}
            iconBg="bg-teal-500/20"
            delay={0.05}
          />
          <StatCard
            value={inProgress}
            label="In Progress"
            icon={<Code2 className="w-5 h-5 text-blue-400" />}
            iconBg="bg-blue-500/20"
            delay={0.1}
          />
          <CountdownTimer
            startTime={settings?.start_time ?? null}
            endTime={settings?.end_time ?? null}
            delay={0.15}
          />
        </div>

        {/* Bottom 3-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BuilderSpotlight builder={spotlight ?? null} />
          <LiveActivity activities={activities} />
          <TopicCloud topics={topics} />
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-6 text-center space-y-1"
        >
          {isUsingDemoData && (
            <p className="text-xs text-amber-400/70">
              Displaying dummy data · Upload your own data from the ticketing platform via Admin to start afresh
            </p>
          )}
          <p className="text-xs font-semibold text-white/50">
            Built with ♥ · Data refreshes automatically
          </p>
        </motion.footer>
      </div>
    </div>
  );
}
