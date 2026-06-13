import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { listRegistryAdminRows } from "@/lib/registry/service";

export async function RegistryAdminPanel() {
  const data = await listRegistryAdminRows();

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <RegistryCard
        title="Modules"
        rows={data.modules.map((m) => `${m.moduleKey} · v${m.version}`)}
      />
      <RegistryCard
        title="Blocks"
        rows={data.blocks.map((b) => `${b.blockKey} → ${b.moduleKey}`)}
      />
      <RegistryCard
        title="Queries"
        rows={data.queries.map((q) => `${q.queryKey} (${q.sourceType})`)}
      />
      <RegistryCard
        title="Layout slots"
        rows={data.slots.map(
          (s) =>
            `${s.pageKey}/${s.slotKey} → ${s.block?.blockKey ?? "unassigned"}`,
        )}
      />
      <RegistryCard
        title="Nodes"
        rows={data.nodes.map((n) => `${n.nodeKey} (${n.nodeType})`)}
      />
      <RegistryCard
        title="Connectors"
        rows={data.connectors.map((c) => `${c.connectorKey} · ${c.connectorType}`)}
      />
    </div>
  );
}

function RegistryCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <Card className="rounded-md border border-border shadow-sm">
      <CardHeader className="p-4 border-b border-border">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        {rows.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">No entries registered.</p>
        ) : (
          <ul className="space-y-1 text-xs text-muted-foreground font-mono">
            {rows.map((row) => (
              <li key={row} className="break-all leading-normal flex items-start gap-1">
                <span className="text-primary select-none">&middot;</span>
                <span>{row}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
