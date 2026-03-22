import { useState } from "react";
import { HelpCircle } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type HelpTab = "overview" | "dashboard" | "admin" | "submit";

interface HelpButtonProps {
  defaultTab?: HelpTab;
  className?: string;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-white/90 font-semibold mb-1">{title}</h3>
      <div className="text-white/70">{children}</div>
    </div>
  );
}

export function HelpButton({ defaultTab = "overview", className }: HelpButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className ?? "flex items-center gap-1.5 text-white/60 hover:text-white/90 transition-colors text-sm"}
      >
        <HelpCircle size={16} />
        Help
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="w-[min(440px,95vw)] bg-[#0f0a1e] border-white/20 text-white overflow-y-auto flex flex-col"
        >
          <SheetHeader className="mb-4 shrink-0">
            <SheetTitle className="text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-purple-400" />
              Help
            </SheetTitle>
          </SheetHeader>

          <Tabs defaultValue={defaultTab} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 w-full bg-white/10 shrink-0 mb-5">
              {(["overview", "dashboard", "admin", "submit"] as HelpTab[]).map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="text-xs capitalize data-[state=active]:bg-purple-700 data-[state=active]:text-white text-white/50"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* ── Overview ─────────────────────────────────────────── */}
            <TabsContent value="overview" className="space-y-4 text-sm mt-0">
              <p className="text-white/70">
                Real-time hackathon dashboard for SheBuilds events. Three pages serve different roles:
              </p>
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left py-1.5 text-white/50 font-medium">URL</th>
                    <th className="text-left py-1.5 text-white/50 font-medium pl-3">Purpose</th>
                  </tr>
                </thead>
                <tbody className="text-white/70">
                  {[
                    ["/", "Live dashboard — projected on screen during the event"],
                    ["/admin", "Organiser panel — manage builders, stats, topics (password required)"],
                    ["/submit", "Builder form — participants submit their app details"],
                  ].map(([url, desc]) => (
                    <tr key={url} className="border-b border-white/10">
                      <td className="py-1.5 font-mono text-purple-300 whitespace-nowrap">{url}</td>
                      <td className="py-1.5 pl-3">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TabsContent>

            {/* ── Dashboard ────────────────────────────────────────── */}
            <TabsContent value="dashboard" className="space-y-4 text-sm mt-0">
              <Section title="Stats Row">
                Shows Active Builders, Completed Apps, In Progress count, and a live Countdown Timer to the event end time.
              </Section>
              <Section title="Builder Spotlight">
                A single featured builder chosen by the organiser from the Admin panel. Displayed prominently on the left.
              </Section>
              <Section title="Live Activity Feed">
                Real-time updates as builders submit apps and change their build status. New entries appear at the top.
              </Section>
              <Section title="Trending Topics">
                Word cloud of project topics — larger words have higher weight. Topics are managed from Admin → Settings.
              </Section>
            </TabsContent>

            {/* ── Admin ────────────────────────────────────────────── */}
            <TabsContent value="admin" className="space-y-4 text-sm mt-0">
              <Section title="Password Gate">
                Navigate to <span className="font-mono text-purple-300">/admin</span> and enter the admin password. The session stays active for the current browser tab.
              </Section>
              <Section title="Settings Tab">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><span className="text-white/90 font-medium">Hackathon Timing</span> — set start and end times. "Set to Now (+3h end)" sets the start to the current time with end 3 hours later.</li>
                  <li><span className="text-white/90 font-medium">Trending Topics</span> — add topics with a weight (1–10). Higher weight = larger word in the cloud. Delete with the trash icon.</li>
                </ul>
              </Section>
              <Section title="Builders Tab">
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li><span className="text-white/90 font-medium">CSV Import</span> — upload a Luma guest export. Name and email columns are auto-detected. Duplicate emails are skipped.</li>
                  <li><span className="text-white/90 font-medium">Search</span> — filter by name, email, or ticket number.</li>
                  <li><span className="text-white/90 font-medium">Edit (pencil)</span> — update app name, app topic, and build status inline.</li>
                  <li><span className="text-white/90 font-medium">Spotlight (star)</span> — feature this builder in the Spotlight panel on the live dashboard.</li>
                  <li><span className="text-white/90 font-medium">Post Activity</span> — add a custom update to the live activity feed for a specific builder.</li>
                  <li><span className="text-white/90 font-medium">Delete (trash)</span> — permanently remove a builder.</li>
                </ul>
              </Section>
              <Section title="Recent Activity">
                Displays the last 50 activity entries. Delete individual entries with the trash icon.
              </Section>
            </TabsContent>

            {/* ── Submit ───────────────────────────────────────────── */}
            <TabsContent value="submit" className="space-y-4 text-sm mt-0">
              <Section title="Form Fields">
                <table className="w-full text-xs border-collapse mt-1">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-1.5 text-white/50 font-medium">Field</th>
                      <th className="text-left py-1.5 text-white/50 font-medium pl-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Full Name *", "Min 2 characters. Displayed on the dashboard."],
                      ["Email *", "Must be valid. One submission per email address."],
                      ["App Name *", "Max 25 characters. Shown on the dashboard card."],
                      ["App Topic", "Optional. Max 25 chars. Appears in the topic cloud."],
                      ["App Link", "Optional. Must start with https://."],
                    ].map(([field, note]) => (
                      <tr key={field} className="border-b border-white/10">
                        <td className="py-1.5 text-white/80 font-medium whitespace-nowrap">{field}</td>
                        <td className="py-1.5 pl-3 text-white/60">{note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
              <Section title="After You Submit">
                Your submission is de-duplicated by email. The In Progress count updates and your activity appears in the live feed. You may be featured in the Spotlight.
              </Section>
              <Section title="Troubleshooting">
                <table className="w-full text-xs border-collapse mt-1">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-1.5 text-white/50 font-medium">Error</th>
                      <th className="text-left py-1.5 text-white/50 font-medium pl-3">Fix</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Already submitted", "Each email can only submit once. Contact the organiser to update your details."],
                      ["Invalid URL", "App link must start with https:// or http://."],
                      ["Name too short", "Enter your full name (at least 2 characters)."],
                    ].map(([error, fix]) => (
                      <tr key={error} className="border-b border-white/10">
                        <td className="py-1.5 text-rose-300 whitespace-nowrap">{error}</td>
                        <td className="py-1.5 pl-3 text-white/60">{fix}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Section>
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </>
  );
}
