"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";

type Props = {
  candidateId?: string;
  status?: string;
  requiresAiCheck?: boolean;
};

export function GenerateMailCandidatesButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function generate() {
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/mail-candidates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ limit: 1200 }),
    });
    const data = await res.json();
    if (res.ok) {
      setMessage(`Created ${data.created}, skipped ${data.skipped}, scanned ${data.scanned}`);
      router.refresh();
    } else {
      setMessage(data.error ?? "generate_failed");
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button disabled={loading} onClick={generate} type="button">
        {loading ? "Generating…" : "Generate from mail"}
      </Button>
      {message ? <span className="text-xs text-muted-foreground">{message}</span> : null}
    </div>
  );
}

export function MailCandidateActions({ candidateId, status, requiresAiCheck = false }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function patch(action: "approve" | "reject" | "revalidate") {
    if (!candidateId) return;
    setLoading(action);
    setError(null);
    const res = await fetch(`/api/mail-candidates/${candidateId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      setError(data.error ?? "patch_failed");
    }
    setLoading(null);
  }

  if (status !== "proposed" && status !== "needs_revalidation") return null;

  if (status === "needs_revalidation" || requiresAiCheck) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          disabled={loading != null}
          onClick={() => patch("revalidate")}
          type="button"
        >
          {loading === "revalidate" ? "Checking…" : "Run AI check"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={loading != null}
          onClick={() => patch("reject")}
          type="button"
        >
          {loading === "reject" ? "Rejecting…" : "Reject"}
        </Button>
        {error ? <span className="text-xs text-destructive">{error}</span> : null}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" disabled={loading != null} onClick={() => patch("approve")} type="button">
        {loading === "approve" ? "Creating…" : "Approve & create"}
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={loading != null}
        onClick={() => patch("reject")}
        type="button"
      >
        {loading === "reject" ? "Rejecting…" : "Reject"}
      </Button>
      {error ? <span className="text-xs text-destructive">{error}</span> : null}
    </div>
  );
}
