import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VenueSourcingTabs } from "@/components/venue-sourcing/VenueSourcingTabs";
import { SyncBanner } from "@/components/venue-sourcing/SyncBanner";
import { FeedbackFormDialog } from "@/components/venue-sourcing/FeedbackFormDialog";
import {
  ENGAGEMENTS, FEEDBACK, FeedbackEntry, VenueEngagement, summariseVenueSourcing,
  completedEngagements, feedbackByEngagement, pendingFeedbackEngagements,
} from "@/data/venueSourcing";
import { NotificationItem } from "@/data/portfolio";
import {
  MessageSquare, CheckCircle2, Star, Heart, Bell, History, Send, Eye,
} from "lucide-react";

function RatingPill({ value, max = 10, tone = "primary" }: { value: number; max?: number; tone?: "primary" | "success" }) {
  const cls = tone === "success"
    ? "border-success/30 bg-success/10 text-success"
    : "border-primary/30 bg-primary/10 text-primary";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums ${cls}`}>
      <Star className="h-3 w-3" /> {value.toFixed(1)} / {max}
    </span>
  );
}

const VenueFeedback = () => {
  const { pathname } = useLocation();
  const k = summariseVenueSourcing();

  const completed = useMemo(() => completedEngagements(), []);
  const pending = useMemo(() => pendingFeedbackEngagements(), []);
  const [localFeedback, setLocalFeedback] = useState<FeedbackEntry[]>(FEEDBACK);
  const [target, setTarget] = useState<VenueEngagement | null>(null);
  const [detail, setDetail] = useState<FeedbackEntry | null>(null);

  const lastSync = ENGAGEMENTS.reduce((m, e) => e.lastSynced > m ? e.lastSynced : m, ENGAGEMENTS[0].lastSynced);

  const submitFeedback = (data: { venueRating: number; serviceRating: number; venueNotes: string; comments: string }) => {
    if (!target) return;
    const fb: FeedbackEntry = {
      id: `FB-${Date.now()}`,
      engagementId: target.id,
      venueRating: data.venueRating,
      serviceRating: data.serviceRating,
      venueNotes: data.venueNotes,
      comments: data.comments,
      submittedAt: new Date().toISOString(),
      submittedBy: "Current User",
      syncStatus: "Synced",
    };
    setLocalFeedback((xs) => [fb, ...xs]);
    setTarget(null);
  };

  const fbFor = (id: string) =>
    localFeedback.find((f) => f.engagementId === id) ?? feedbackByEngagement(id);

  const onOpenNotification = (_n: NotificationItem) => {};

  return (
    <>
      <AppShell onOpenNotification={onOpenNotification}>
        <div className="space-y-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight">Venue Sourcing</h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Provide and review feedback on completed venue sourcing engagements — venue quality, AOK service, and historical performance.
              </p>
            </div>
          </div>

          <SyncBanner lastSynced={lastSync} />

          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard icon={Bell}          label="Feedback Pending"        value={k.pendingFeedback}                  sub="action req." trend={-1} variant="sparkline" />
            <StatCard icon={CheckCircle2}  label="Feedback Submitted"      value={k.feedbackSubmitted + (localFeedback.length - FEEDBACK.length)} sub="all-time" trend={4} variant="matrix" />
            <StatCard icon={Star}          label="Avg. Venue Rating"       value={`${k.avgVenueRating.toFixed(1)} / 10`} sub="portfolio" trend={2} variant="radial" progress={k.avgVenueRating * 10} />
            <StatCard icon={Heart}         label="Avg. AOK Service Rating" value={`${k.avgServiceRating.toFixed(1)} / 10`} sub="portfolio" trend={3} variant="gauge" progress={k.avgServiceRating * 10} />
          </div>

          <VenueSourcingTabs currentPath={pathname} />

          {/* Pending feedback prompts */}
          {pending.length > 0 && (
            <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Bell className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold">How was your venue sourcing experience?</h2>
              </div>
              <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                {pending.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium">{e.eventName}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{e.venue} · Completed {new Date(e.completedAt!).toLocaleDateString()}</div>
                    </div>
                    <Button size="sm" onClick={() => setTarget(e)}>
                      <Send className="mr-1.5 h-3.5 w-3.5" /> Provide Feedback
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed engagements */}
          <div>
            <h2 className="mb-3 text-sm font-semibold">Completed Engagements</h2>
            <div className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xs">
              <div className="max-h-[520px] overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-secondary/60 backdrop-blur">
                    <tr className="border-b border-border/60 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-3">Event</th>
                      <th className="px-3 py-3">Venue</th>
                      <th className="px-3 py-3">Completion Date</th>
                      <th className="px-3 py-3">Feedback Status</th>
                      <th className="px-3 py-3">Venue Rating</th>
                      <th className="px-3 py-3">Service Rating</th>
                      <th className="px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {completed.map((e) => {
                      const fb = fbFor(e.id);
                      return (
                        <tr key={e.id} className="border-b border-border/50 transition-colors hover:bg-secondary/40">
                          <td className="px-3 py-2.5 text-sm font-medium">{e.eventName}</td>
                          <td className="px-3 py-2.5 text-xs text-muted-foreground">{e.venue}</td>
                          <td className="px-3 py-2.5 text-xs">{e.completedAt ? new Date(e.completedAt).toLocaleDateString() : "—"}</td>
                          <td className="px-3 py-2.5">
                            {fb
                              ? <Badge variant="outline" className="border-success/30 bg-success/10 text-success">Submitted</Badge>
                              : <Badge variant="outline" className="border-warning/30 bg-warning/10 text-warning">Pending</Badge>
                            }
                          </td>
                          <td className="px-3 py-2.5">{fb ? <RatingPill value={fb.venueRating} /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                          <td className="px-3 py-2.5">{fb ? <RatingPill value={fb.serviceRating} tone="success" /> : <span className="text-xs text-muted-foreground">—</span>}</td>
                          <td className="px-3 py-2.5 text-right">
                            {fb
                              ? <Button size="sm" variant="ghost" onClick={() => setDetail(fb)}><Eye className="h-4 w-4" /></Button>
                              : <Button size="sm" onClick={() => setTarget(e)}><Send className="mr-1.5 h-3.5 w-3.5" /> Feedback</Button>
                            }
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Feedback history by venue */}
          <div>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
              <History className="h-4 w-4" /> Feedback History by Venue
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Array.from(new Set(localFeedback.map((f) => {
                const e = ENGAGEMENTS.find((x) => x.id === f.engagementId);
                return e?.venue;
              }).filter(Boolean) as string[])).map((venue) => {
                const items = localFeedback.filter((f) => {
                  const e = ENGAGEMENTS.find((x) => x.id === f.engagementId);
                  return e?.venue === venue;
                });
                const avg = items.reduce((s, f) => s + f.venueRating, 0) / items.length;
                return (
                  <div key={venue} className="rounded-2xl border border-border/60 bg-card p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{venue}</div>
                      <RatingPill value={avg} />
                    </div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {items.length} engagement{items.length !== 1 ? "s" : ""}
                    </div>
                    <ol className="mt-3 space-y-1.5 border-l border-border/60 pl-3">
                      {items.map((f) => (
                        <li key={f.id} className="relative text-[11px]">
                          <span className="absolute -left-[0.9rem] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-muted-foreground">{new Date(f.submittedAt).toLocaleDateString()}</span>
                            <span className="tabular-nums font-semibold">{f.venueRating}/10</span>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </AppShell>

      <FeedbackFormDialog
        engagement={target}
        open={!!target}
        onOpenChange={(o) => !o && setTarget(null)}
        onSubmit={submitFeedback}
      />

      {/* Simple detail viewer */}
      {detail && (
        <FeedbackFormDialog
          engagement={ENGAGEMENTS.find((e) => e.id === detail.engagementId) ?? null}
          open={false}
          onOpenChange={() => setDetail(null)}
          onSubmit={() => {}}
        />
      )}
      {detail && (() => {
        const e = ENGAGEMENTS.find((x) => x.id === detail.engagementId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm" onClick={() => setDetail(null)}>
            <div className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-5 shadow-elegant" onClick={(ev) => ev.stopPropagation()}>
              <h3 className="text-base font-semibold">{e?.eventName}</h3>
              <p className="text-xs text-muted-foreground">{e?.venue} · Submitted {new Date(detail.submittedAt).toLocaleDateString()} by {detail.submittedBy}</p>
              <div className="mt-3 flex gap-2"><RatingPill value={detail.venueRating} /><RatingPill value={detail.serviceRating} tone="success" /></div>
              {detail.venueNotes && (
                <div className="mt-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Venue Notes</div>
                  <p className="mt-0.5 text-sm">{detail.venueNotes}</p>
                </div>
              )}
              {detail.comments && (
                <div className="mt-3">
                  <div className="text-[11px] uppercase tracking-wide text-muted-foreground">Comments</div>
                  <p className="mt-0.5 text-sm">{detail.comments}</p>
                </div>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setDetail(null)}>Close</Button>
              </div>
            </div>
          </div>
        );
      })()}
    </>
  );
};

export default VenueFeedback;
