import { NextRequest, NextResponse } from "next/server";

const CFO_API = (process.env.CFO_API_URL ?? "http://127.0.0.1:4100/api").replace(
  "localhost",
  "127.0.0.1",
);

async function proxy(req: NextRequest, path: string) {
  const url = `${CFO_API.replace(/\/$/, "")}/${path}${req.nextUrl.search}`;
  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
  };
  if (process.env.API_KEY) {
    headers["X-API-Key"] = process.env.API_KEY;
  }
  const init: RequestInit = { method: req.method, headers };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.text();
  }
  const res = await fetch(url, init);
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("content-type") ?? "application/json",
    },
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function PATCH(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}

export async function DELETE(
  req: NextRequest,
  ctx: { params: Promise<{ path: string[] }> },
) {
  const { path } = await ctx.params;
  return proxy(req, path.join("/"));
}
