export const dynamic = "force-dynamic";

import Link from "next/link";

import { listMailDerivedCandidates } from "@ai-portal/automation/mail-candidates";
import { prisma } from "@ai-portal/db";

import {
  GenerateMailCandidatesButton,
  MailCandidateActions,
} from "@/components/development/mail-candidate-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const entityHref: Record<string, string> = {
  customer: "/customers",
  partner: "/partners",
  task: "/tasks",
  opportunity: "/opportunities",
  poc: "/poc",
};

function formatDate(value?: Date | null) {
  if (!value) return "unknown date";
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function hasAiRevalidation(metadata: unknown) {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return false;
  const revalidation = (metadata as Record<string, unknown>).aiRevalidation;
  return Boolean(revalidation && typeof revalidation === "object" && !Array.isArray(revalidation));
}

function isProjectCandidate(candidateType: string) {
  return candidateType === "task" || candidateType === "opportunity" || candidateType === "poc";
}

export default async function MailCandidatesPage() {
  const [candidates, mailCount, businessCounts] = await Promise.all([
    listMailDerivedCandidates({ limit: 100 }),
    prisma.knowledgeDocument.count({ where: { source: "mail-intelligence" } }),
    Promise.all([
      prisma.customer.count(),
      prisma.partner.count(),
      prisma.workTask.count(),
      prisma.opportunity.count(),
      prisma.pocProject.count(),
    ]),
  ]);
  const needsRevalidation = candidates.filter((candidate) =>
    candidate.status === "needs_revalidation" ||
    (candidate.status === "proposed" &&
      isProjectCandidate(candidate.candidateType) &&
      !hasAiRevalidation(candidate.metadata))
  ).length;
  const proposed = candidates.filter((candidate) =>
    candidate.status === "proposed" &&
    (!isProjectCandidate(candidate.candidateType) || hasAiRevalidation(candidate.metadata))
  ).length;
  const converted = candidates.filter((candidate) => candidate.status === "converted").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-normal">Mail Candidates</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Imported mail intelligence is analyzed into candidate work. Nothing becomes a customer,
            partner, task, opportunity, or PoC until an operator approves it here. Project-like
            candidates must pass AIOS AI revalidation before they enter approval review.
          </p>
        </div>
        <GenerateMailCandidatesButton />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Mail documents</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{mailCount}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Proposed</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{proposed}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Needs AI check</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{needsRevalidation}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Converted</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{converted}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Business objects</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {businessCounts[0]} customers · {businessCounts[1]} partners · {businessCounts[2]} tasks ·{" "}
            {businessCounts[3]} opps · {businessCounts[4]} PoCs
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3">
        {candidates.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-sm text-muted-foreground">
              No mail candidates yet. Generate candidates from the imported mail intelligence cache.
            </CardContent>
          </Card>
        ) : (
          candidates.map((candidate) => (
            <Card key={candidate.id}>
              <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">{candidate.candidateType}</Badge>
                    <Badge variant={candidate.status === "converted" ? "secondary" : "outline"}>
                      {candidate.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      confidence {candidate.confidence}
                    </span>
                  </div>
                  <CardTitle className="break-words text-base">{candidate.title}</CardTitle>
                </div>
                <MailCandidateActions
                  candidateId={candidate.id}
                  status={candidate.status}
                  requiresAiCheck={isProjectCandidate(candidate.candidateType) && !hasAiRevalidation(candidate.metadata)}
                />
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="break-words text-muted-foreground">{candidate.summary}</p>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                  <span className="break-words">Source: {candidate.sourceTitle ?? "mail"}</span>
                  <span className="break-words">Sender: {candidate.sourceSender ?? "unknown"}</span>
                  <span>Received: {formatDate(candidate.sourceReceivedAt)}</span>
                  {candidate.createdEntityId && candidate.createdEntityType ? (
                    <Link
                      className="text-primary hover:underline"
                      href={entityHref[candidate.createdEntityType] ?? "/development/mail-candidates"}
                    >
                      Created {candidate.createdEntityType}: {candidate.createdEntityId.slice(0, 8)}
                    </Link>
                  ) : (
                    <span>Created entity: none</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
