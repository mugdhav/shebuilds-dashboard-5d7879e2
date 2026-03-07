import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Users, MessageSquare, Settings, Trash2,
  Plus, Star, StarOff, ArrowLeft, Search, Upload,
  Pencil, Check, X, Ticket, FileText
} from "lucide-react";
import { Link } from "react-router-dom";
import type { Participant, Activity, Topic, HackathonSettings } from "@/types/hackathon";
import { adminApi } from "@/lib/adminApi";
import { adminFriendlyError } from "@/lib/errorMessages";

// ─── helpers ────────────────────────────────────────────────────────────────

function toDateTimeLocal(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = new Date(date as string);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDisplayTime(date: Date | string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(date as string);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" });
}

const BUILD_STATUS_OPTIONS = [
  { value: "", label: "— no status —" },
  { value: "is designing", label: "🎨 is designing" },
  { value: "is building", label: "🔨 is building" },
  { value: "is testing", label: "🧪 is testing" },
];

const BUILD_STATUS_EMOJI: Record<string, string> = {
  "is designing": "🎨",
  "is building": "🔨",
  "is testing": "🧪",
};

const EMOJI_OPTIONS = [
  { label: "Rocket", value: "🚀" },
  { label: "Sparkle", value: "✨" },
  { label: "Fire", value: "🔥" },
  { label: "Trophy", value: "🏆" },
  { label: "Bulb", value: "💡" },
  { label: "Party", value: "🎉" },
  { label: "Star", value: "⭐" },
  { label: "Heart", value: "❤️" },
  { label: "Globe", value: "🌍" },
  { label: "Wheelchair", value: "♿" },
];

const scrollCls =
  "overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20";

function DeleteBtn({ onClick, testId }: { onClick: () => void; testId?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      className="p-1.5 rounded-md text-white/25 hover:text-rose-400 hover:bg-white/10 transition-colors"
    >
      <Trash2 className="w-3.5 h-3.5" />
    </button>
  );
}

// ─── Settings tab ────────────────────────────────────────────────────────────

function SettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data } = await supabase.from("hackathon_settings").select("*").limit(1).single();
      return data as HackathonSettings | null;
    },
  });

  const [timeForm, setTimeForm] = useState({ startTime: "", endTime: "" });

  const updateTimeMutation = useMutation({
    mutationFn: async (payload: { start_time?: string; end_time?: string }) => {
      await adminApi("settings.update", { id: settings?.id ?? 1, data: payload });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Settings saved" });
    },
    onError: (err: Error) => {
      console.error("Settings update error:", err);
      toast({ title: "Error", description: adminFriendlyError(err), variant: "destructive" });
    },
  });

  const handleStartChange = (value: string) => {
    const updated = { ...timeForm, startTime: value };
    if (value && !timeForm.endTime) {
      const s = new Date(value);
      if (!isNaN(s.getTime())) {
        updated.endTime = toDateTimeLocal(new Date(s.getTime() + 3 * 60 * 60 * 1000));
      }
    }
    setTimeForm(updated);
  };

  const handleSetNow = () => {
    const now = new Date();
    setTimeForm({
      startTime: toDateTimeLocal(now),
      endTime: toDateTimeLocal(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
    });
  };

  const handleTimeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: any = {};
    if (timeForm.startTime) payload.start_time = new Date(timeForm.startTime).toISOString();
    if (timeForm.endTime) payload.end_time = new Date(timeForm.endTime).toISOString();
    updateTimeMutation.mutate(payload);
  };

  // ── Trending topics ───────────────────────────────────────────────────────
  const { data: topicsData } = useQuery({
    queryKey: ["admin-topics"],
    queryFn: async () => {
      const { data } = await supabase.from("topics").select("*").order("id");
      return (data || []) as Topic[];
    },
  });
  const topicList = topicsData || [];
  const [topicForm, setTopicForm] = useState({ name: "", weight: "1" });

  const addTopicMutation = useMutation({
    mutationFn: async (data: { name: string; weight: number }) => {
      await adminApi("topics.insert", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setTopicForm({ name: "", weight: "1" });
      toast({ title: "Topic added" });
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteTopicMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApi("topics.delete", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-topics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Topic removed" });
    },
  });

  return (
    <div className="space-y-4">
      {/* Hackathon timing */}
      <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-5 h-5" />
            Hackathon Timing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-md bg-white/10 border border-white/10 p-2.5">
              <div className="text-white/50 mb-0.5">Current Start</div>
              <div className="font-medium">{formatDisplayTime(settings?.start_time)}</div>
            </div>
            <div className="rounded-md bg-white/10 border border-white/10 p-2.5">
              <div className="text-white/50 mb-0.5">Current End</div>
              <div className="font-medium">{formatDisplayTime(settings?.end_time)}</div>
            </div>
          </div>

          <form onSubmit={handleTimeSubmit} className="space-y-3">
            <div className="flex items-end justify-between mb-1">
              <span className="text-xs text-white/60">Hackathon window</span>
              <button
                type="button"
                onClick={handleSetNow}
                className="text-xs text-white/50 hover:text-white/90 transition-colors"
              >
                Set to Now (+3h end)
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="startTime" className="text-xs">Start</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={timeForm.startTime}
                  onChange={(e) => handleStartChange(e.target.value)}
                  className="bg-white/10 text-white border-white/20 [color-scheme:dark] text-xs px-2"
                />
              </div>
              <div>
                <Label htmlFor="endTime" className="text-xs">End</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={timeForm.endTime}
                  onChange={(e) => setTimeForm({ ...timeForm, endTime: e.target.value })}
                  className="bg-white/10 text-white border-white/20 [color-scheme:dark] text-xs px-2"
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateTimeMutation.isPending}
            >
              {updateTimeMutation.isPending ? "Saving…" : "Save Timing"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Trending topics */}
      <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5" />
            Trending Topics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!topicForm.name) return;
              addTopicMutation.mutate({ name: topicForm.name, weight: parseInt(topicForm.weight) || 1 });
            }}
            className="flex gap-2 mb-4"
          >
            <Input
              placeholder="Topic name"
              value={topicForm.name}
              onChange={(e) => setTopicForm({ ...topicForm, name: e.target.value })}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <Input
              type="number"
              min="1"
              max="10"
              value={topicForm.weight}
              onChange={(e) => setTopicForm({ ...topicForm, weight: e.target.value })}
              className="w-16 text-center bg-white/10 border-white/20 text-white"
              title="Weight"
            />
            <Button type="submit" disabled={addTopicMutation.isPending}>
              <Plus className="w-4 h-4" />
            </Button>
          </form>

          <div className={`flex flex-wrap gap-2 max-h-40 ${scrollCls}`}>
            {topicList.map((t) => (
              <div
                key={t.id}
                className="flex items-center gap-1 bg-white/10 border border-white/15 rounded-full pl-3 pr-1 py-1"
              >
                <span className="text-sm">{t.name}</span>
                <span className="text-xs text-white/40">({t.weight})</span>
                <DeleteBtn onClick={() => deleteTopicMutation.mutate(t.id)} />
              </div>
            ))}
            {topicList.length === 0 && (
              <p className="text-sm text-white/50 w-full text-center py-3">No topics yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Builders tab ─────────────────────────────────────────────────────────────

function generateInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function generateColor(): string {
  const colors = [
    "#a855f7", "#ec4899", "#f97316", "#06b6d4", "#10b981",
    "#8b5cf6", "#f43f5e", "#eab308", "#3b82f6", "#14b8a6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function CsvImporter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImport = async () => {
    if (!selectedFile) return;
    setIsImporting(true);

    try {
      const text = await selectedFile.text();
      const lines = text.split("\n").filter((l) => l.trim());
      if (lines.length < 2) {
        toast({ title: "CSV is empty", variant: "destructive" });
        setIsImporting(false);
        return;
      }

      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase().replace(/^"|"$/g, ""));

      const nameCol = headers.findIndex((h) =>
        ["name", "full name", "full_name", "guest name", "attendee name"].includes(h)
      );
      const emailCol = headers.findIndex((h) =>
        ["email", "email address", "email_address", "guest email"].includes(h)
      );
      const ticketCol = headers.findIndex((h) =>
        ["ticket", "ticket number", "ticket_number", "ticket_key", "ticket id", "ticket_id", "order number", "order_number"].includes(h)
      );
      const lumaCol = headers.findIndex((h) => ["api_id", "guest_id", "api id"].includes(h));
      const checkedInCol = headers.findIndex((h) =>
        ["checked in", "checked_in", "check-in", "check in", "checked_in_at", "checked in at", "approval status", "has_joined_event", "has joined event"].includes(h)
      );

      if (nameCol === -1 && emailCol === -1) {
        toast({ title: "CSV must contain Name or Email column", variant: "destructive" });
        setIsImporting(false);
        return;
      }

      // Build rows array client-side (no DB calls here)
      const rows = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
        const name = nameCol >= 0 ? cols[nameCol] || "" : "";
        const email = emailCol >= 0 ? cols[emailCol] || "" : "";
        const ticket = ticketCol >= 0 ? cols[ticketCol] || "" : "";
        const lumaId = lumaCol >= 0 ? cols[lumaCol] || "" : "";
        const checkedInValue = checkedInCol >= 0 ? cols[checkedInCol] || "" : "";

        if (!name && !email) continue;

        const displayName = name || email.split("@")[0] || "Unknown";
        const isCheckedIn = checkedInValue
          ? ["yes", "true", "1", "checked in", "approved"].includes(checkedInValue.toLowerCase())
          : false;

        rows.push({
          name: displayName,
          avatar_initials: generateInitials(displayName),
          avatar_color: generateColor(),
          status: isCheckedIn ? "checked-in" : "active",
          is_spotlight: false,
          ticket_number: ticket || lumaId || null,
          email: email || null,
          luma_guest_id: lumaId || null,
          checked_in: isCheckedIn,
        });
      }

      if (rows.length === 0) {
        toast({ title: "No valid rows found in CSV", variant: "destructive" });
        setIsImporting(false);
        return;
      }

      // Fetch current settings count (read — stays client-side)
      const { data: settings } = await supabase
        .from("hackathon_settings").select("id, active_participants").limit(1).single();

      // Dedup + insert + settings update all happen server-side via service_role
      const result = await adminApi("participants.import", {
        rows,
        settingsId: settings?.id ?? null,
        currentCount: settings?.active_participants ?? 0,
      });

      queryClient.invalidateQueries({ queryKey: ["admin-participants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({
        title: "CSV import complete",
        description: `Imported ${result.imported} builders, ${result.skipped} already existed.`,
      });
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      console.error("CSV import error:", err);
      toast({ title: "Import failed", description: adminFriendlyError(err), variant: "destructive" });
    }

    setIsImporting(false);
  };

  return (
    <Card className="bg-black/30 backdrop-blur-md border border-dashed border-white/20 text-white">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Upload className="w-5 h-5" />
          Import from CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-white/50 mb-3">
          Luma guest list export — imports names, emails, ticket numbers. App details set after upload.
        </p>
        <div className="space-y-3">
          <div
            className="border-2 border-dashed border-white/25 rounded-lg p-4 text-center cursor-pointer hover:bg-white/5 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                if (!file.name.toLowerCase().endsWith(".csv")) {
                  toast({ title: "Invalid file", description: "Please select a CSV file.", variant: "destructive" });
                  return;
                }
                setSelectedFile(file);
              }}
              className="hidden"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="w-5 h-5 text-white/60" />
                <span className="text-sm font-medium">{selectedFile.name}</span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-white/40 hover:text-white/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-7 h-7 mx-auto mb-1.5 text-white/40" />
                <p className="text-sm text-white/50">Click to select a CSV file</p>
              </>
            )}
          </div>
          <Button
            onClick={handleImport}
            disabled={isImporting || !selectedFile}
            className="w-full"
          >
            {isImporting ? "Importing…" : "Import Builders"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BuildersTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setSearchQuery(searchInput), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [searchInput]);

  const { data: participantsData, isLoading } = useQuery({
    queryKey: ["admin-participants", searchQuery],
    queryFn: async () => {
      let query = supabase.from("participants").select("*").order("created_at", { ascending: false });
      if (searchQuery.trim()) {
        query = query.or(`name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%,ticket_number.ilike.%${searchQuery}%`);
      }
      const { data } = await query;
      return (data || []) as Participant[];
    },
  });
  const participants = participantsData || [];

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ projectName: "", appTopic: "", buildStatus: "" });
  const [activityForm, setActivityForm] = useState({ action: "", emoji: "🚀" });

  useEffect(() => {
    if (editingId === null) setActivityForm({ action: "", emoji: "🚀" });
  }, [editingId]);

  const { data: activitiesData } = useQuery({
    queryKey: ["admin-activities"],
    queryFn: async () => {
      const { data } = await supabase.from("activities").select("*").order("created_at", { ascending: false }).limit(50);
      return (data || []) as Activity[];
    },
  });
  const activityList = activitiesData || [];

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApi("participants.delete", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-participants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Builder removed" });
    },
  });

  const spotlightMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApi("participants.spotlight", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-participants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Spotlight updated" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data, currentName, currentBuildStatus }: { id: number; data: any; currentName: string; currentBuildStatus: string | null }) => {
      let autoActivity = null;
      if (data.build_status && data.build_status !== currentBuildStatus) {
        const appName = data.project_name || null;
        if (appName) {
          const emojiMap: Record<string, string> = {
            "is designing": "🎨",
            "is building": "🔨",
            "is testing": "🧪",
          };
          autoActivity = {
            participant_name: currentName,
            action: `${data.build_status} ${appName}`,
            emoji: emojiMap[data.build_status] || "✨",
          };
        }
      }
      await adminApi("participants.update_with_activity", { id, data, autoActivity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-participants"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      toast({ title: "Builder updated" });
      setEditingId(null);
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const postActivityMutation = useMutation({
    mutationFn: async (data: { participant_name: string; action: string; emoji: string }) => {
      await adminApi("activities.insert", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      setActivityForm({ action: "", emoji: "🚀" });
      toast({ title: "Activity posted" });
    },
    onError: (err: Error) =>
      toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteActivityMutation = useMutation({
    mutationFn: async (id: number) => {
      await adminApi("activities.delete", { id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-activities"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast({ title: "Activity removed" });
    },
  });

  const handleEdit = (p: Participant) => {
    setEditingId(p.id);
    setEditForm({ projectName: p.project_name || "", appTopic: p.app_topic || "", buildStatus: p.build_status || "" });
  };

  const handleSave = (p: Participant) => {
    updateMutation.mutate({
      id: p.id,
      data: {
        project_name: editForm.projectName.trim() || null,
        app_topic: editForm.appTopic.trim() || null,
        build_status: editForm.buildStatus || null,
      },
      currentName: p.name,
      currentBuildStatus: p.build_status,
    });
  };

  const handlePostActivity = (participantName: string) => {
    if (!activityForm.action.trim()) return;
    postActivityMutation.mutate({
      participant_name: participantName,
      action: activityForm.action.trim(),
      emoji: activityForm.emoji,
    });
  };

  return (
    <div className="space-y-4">
      <CsvImporter />

      <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-5 h-5" />
            Builders ({participants.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              placeholder="Search by name, email, or ticket…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
          </div>

          <div className={`space-y-2 max-h-[520px] ${scrollCls}`}>
            {isLoading && (
              <p className="text-sm text-white/50 text-center py-4">Searching…</p>
            )}

            {participants.map((p) => (
              <div
                key={p.id}
                className="rounded-lg bg-white/[0.08] border border-white/10"
              >
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: p.avatar_color }}
                  >
                    {p.avatar_initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.is_spotlight && (
                        <Badge variant="secondary" className="text-[10px] py-0">Spotlight</Badge>
                      )}
                      {p.checked_in && (
                        <Badge variant="outline" className="text-[10px] py-0 text-emerald-400 border-emerald-500/30">In</Badge>
                      )}
                      {p.build_status && (
                        <span className="text-[11px] text-blue-300/80">
                          {BUILD_STATUS_EMOJI[p.build_status]} {p.build_status}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {p.ticket_number && (
                        <span className="flex items-center gap-0.5 text-[11px] text-white/40">
                          <Ticket className="w-3 h-3" />{p.ticket_number}
                        </span>
                      )}
                      {p.project_name && (
                        <span className="text-[11px] text-white/50 truncate">
                          {p.project_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => editingId === p.id ? setEditingId(null) : handleEdit(p)}
                      className={`p-1.5 rounded-md transition-colors ${
                        editingId === p.id
                          ? "bg-white/20 text-white"
                          : "text-white/40 hover:text-white/80 hover:bg-white/10"
                      }`}
                      title="Edit builder"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => spotlightMutation.mutate(p.id)}
                      className="p-1.5 rounded-md text-white/40 hover:text-yellow-400 hover:bg-white/10 transition-colors"
                    >
                      {p.is_spotlight
                        ? <StarOff className="w-3.5 h-3.5 text-yellow-400" />
                        : <Star className="w-3.5 h-3.5" />}
                    </button>
                    <DeleteBtn onClick={() => deleteMutation.mutate(p.id)} />
                  </div>
                </div>

                {editingId === p.id && (
                  <div className="border-t border-white/10 px-3 pb-3 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-white/60">App Name</Label>
                        <Input
                          placeholder="Mango AI"
                          maxLength={25}
                          value={editForm.projectName}
                          onChange={(e) => setEditForm({ ...editForm, projectName: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-white/60">App Topic</Label>
                        <Input
                          placeholder="HealthTech"
                          maxLength={25}
                          value={editForm.appTopic}
                          onChange={(e) => setEditForm({ ...editForm, appTopic: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-white/60">Build Status</Label>
                      <select
                        value={editForm.buildStatus}
                        onChange={(e) => setEditForm({ ...editForm, buildStatus: e.target.value })}
                        className="mt-1 w-full rounded-md bg-white/10 border border-white/20 text-white text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-white/30"
                      >
                        {BUILD_STATUS_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value} className="bg-gray-900">
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="flex-1 border-white/20 text-white/70 hover:text-white"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSave(p)}
                        disabled={updateMutation.isPending}
                      >
                        <Check className="w-3.5 h-3.5 mr-1" />
                        {updateMutation.isPending ? "Saving…" : "Save"}
                      </Button>
                    </div>

                    {/* Post Activity */}
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-xs text-white/40 mb-2 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        Post activity for <span className="text-white/70 font-medium">{p.name}</span>
                      </p>
                      <div className="space-y-2">
                        <Input
                          placeholder="e.g. just launched their MVP!"
                          value={activityForm.action}
                          onChange={(e) => setActivityForm({ ...activityForm, action: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-white/40"
                        />
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {EMOJI_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => setActivityForm({ ...activityForm, emoji: opt.value })}
                              className={`w-8 h-8 flex items-center justify-center rounded-md text-base transition-all ${
                                activityForm.emoji === opt.value
                                  ? "bg-white/25 ring-1 ring-white/50"
                                  : "bg-white/[0.08] hover:bg-white/15"
                              }`}
                            >
                              {opt.value}
                            </button>
                          ))}
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full"
                          onClick={() => handlePostActivity(p.name)}
                          disabled={postActivityMutation.isPending || !activityForm.action.trim()}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1" />
                          {postActivityMutation.isPending ? "Posting…" : "Post Activity"}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {!isLoading && participants.length === 0 && (
              <p className="text-sm text-white/50 text-center py-6">
                {searchInput ? "No builders match your search." : "No builders yet — import a CSV to get started."}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent activity */}
      <Card className="bg-black/30 backdrop-blur-md border border-white/20 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`space-y-1.5 max-h-60 ${scrollCls}`}>
            {activityList.map((a) => (
              <div
                key={a.id}
                className="flex items-center gap-2.5 px-2.5 py-2 rounded-md bg-white/[0.08] border border-white/[0.08]"
              >
                <span className="text-base shrink-0">{a.emoji}</span>
                <p className="flex-1 text-sm min-w-0 truncate">
                  <span className="font-medium">{a.participant_name}</span>{" "}
                  <span className="text-white/55">{a.action}</span>
                </p>
                <DeleteBtn onClick={() => deleteActivityMutation.mutate(a.id)} />
              </div>
            ))}
            {activityList.length === 0 && (
              <p className="text-sm text-white/50 text-center py-4">No activities yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #5271FF 0%, #E07CFF 25%, #E83F9B 50%, #FF3366 70%, #FF6B00 100%)' }}>
      <header className="sticky top-0 z-50 bg-black/30 backdrop-blur-md border-b border-white/20 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button
                size="icon"
                variant="ghost"
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-lg font-bold leading-tight text-white">Admin Panel</h1>
              <p className="text-xs text-white/50">Manage hackathon dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open('/Help.html', '_blank')}
              className="cursor-pointer bg-white/15 text-white hover:bg-white/25 border border-white/20 rounded-md px-2.5 py-0.5 text-xs font-medium"
            >
              Help
            </button>
            <Link to="/">
              <Badge
                variant="secondary"
                className="cursor-pointer bg-white/15 text-white hover:bg-white/25 border-white/20"
              >
                View Dashboard
              </Badge>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 pb-20">
        <Tabs defaultValue="settings" className="w-full">
          <TabsList
            className="w-full grid grid-cols-2 mb-4 bg-black/30 border border-white/15 rounded-xl p-1 gap-1 h-auto"
          >
            <TabsTrigger
              value="settings"
              className="rounded-lg py-2.5 text-sm font-medium text-white/55 flex items-center justify-center gap-2
                         data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-none
                         hover:text-white/80 transition-all"
            >
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
            <TabsTrigger
              value="builders"
              className="rounded-lg py-2.5 text-sm font-medium text-white/55 flex items-center justify-center gap-2
                         data-[state=active]:bg-white/20 data-[state=active]:text-white data-[state=active]:shadow-none
                         hover:text-white/80 transition-all"
            >
              <Users className="w-4 h-4" />
              Builders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
          <TabsContent value="builders">
            <BuildersTab />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
