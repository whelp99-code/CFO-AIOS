export const dynamic = "force-dynamic";

import { getDashboardWidgets, getExecutiveSummary } from "@ai-portal/automation";
import Link from "next/link";

import { RegistryPageView } from "@/components/registry/registry-page-view";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const [summary, widgets] = await Promise.all([
    getExecutiveSummary(),
    getDashboardWidgets(),
  ]);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Customers" value={summary.customers} />
        <MetricCard title="Open tasks" value={summary.openTasks} />
        <MetricCard title="Today tasks" value={summary.todayTasks} />
        <MetricCard title="Active PoCs" value={summary.activePocs} />
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Approval queue</CardTitle>
          <Link href="/approvals" className="text-sm text-muted-foreground hover:underline">
            Review
          </Link>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm sm:grid-cols-2">
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span>Mail candidates awaiting approval</span>
            <Badge variant={summary.approvals.mailCandidates > 0 ? "outline" : "secondary"}>
              {summary.approvals.mailCandidates}
            </Badge>
          </div>
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <span>Automation approvals</span>
            <Badge variant={summary.approvals.automation > 0 ? "outline" : "secondary"}>
              {summary.approvals.automation}
            </Badge>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        <WidgetList
          title="Today's tasks"
          empty="No tasks due today."
          items={widgets.todayTasks.map((t) => ({
            key: t.id,
            label: t.title,
            meta: t.status,
            href: "/tasks",
          }))}
        />
        <WidgetList
          title="Urgent tasks"
          empty="No urgent tasks."
          items={widgets.urgentTasks.map((t) => ({
            key: t.id,
            label: t.title,
            meta: t.priority,
            href: "/tasks",
          }))}
        />
        <WidgetList
          title="Active PoCs"
          empty="No active PoCs."
          items={widgets.activePocs.map((p) => ({
            key: p.id,
            label: p.title,
            meta: p.status,
            href: `/poc/${p.id}`,
          }))}
        />
        <WidgetList
          title="Top opportunities"
          empty="No open opportunities."
          items={widgets.topOpportunities.map((o) => ({
            key: o.id,
            label: o.title,
            meta: `${o.stage} · ${o.probability}%`,
            href: `/opportunities/${o.id}`,
          }))}
        />
        <WidgetList
          title="Recent proposals"
          empty="No proposals yet."
          items={widgets.recentProposals.map((d) => ({
            key: d.id,
            label: d.title,
            meta: d.status,
            href: `/proposals/${d.id}`,
          }))}
        />
        <Card>
          <CardHeader><CardTitle>Dev & validation</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>Command runs: {widgets.devStatus.latestRuns.length} recent</p>
            <p>Codex tasks: {widgets.devStatus.codexTasks}</p>
            <p>Cursor sessions: {widgets.devStatus.cursorSessions}</p>
            <p className={widgets.devStatus.validationFailures > 0 ? "text-destructive" : ""}>
              Validation failures: {widgets.devStatus.validationFailures}
            </p>
            {widgets.devStatus.latestRuns.map((r) => (
              <div key={r.id} className="flex justify-between">
                <Link href={`/commands/${r.id}`} className="hover:underline">{r.id.slice(0, 8)}…</Link>
                <Badge variant="outline">{r.status}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Opportunity pipeline</CardTitle>
          <Link href="/opportunities" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(summary.opportunities.byStage).map(([stage, count]) => (
            <div key={stage} className="flex justify-between rounded-md border px-3 py-2">
              <span className="capitalize">{stage}</span>
              <span className="font-medium">{count}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <RegistryPageView
        pageKey="dashboard"
        title="Registry widgets"
        description="Registry-driven dashboard blocks."
      />
    </div>
  );
}

function MetricCard({ title, value }: { title: string; value: number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}

function WidgetList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { key: string; label: string; meta: string; href: string }[];
}) {
  return (
    <Card>
      <CardHeader><CardTitle className="text-base">{title}</CardTitle></CardHeader>
      <CardContent className="space-y-2 text-sm">
        {items.length === 0 ? (
          <p className="text-muted-foreground">{empty}</p>
        ) : (
          items.map((item) => (
            <div key={item.key} className="flex justify-between gap-2">
              <Link href={item.href} className="truncate hover:underline">{item.label}</Link>
              <Badge variant="outline">{item.meta}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
