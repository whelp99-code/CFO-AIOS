import { createCustomer, listCustomers } from "@ai-portal/automation";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get("q") ?? undefined;
  try {
    const customers = await listCustomers("demo-project", search);
    return NextResponse.json({ customers });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "list_failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const customer = await createCustomer(body);
    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "create_failed" },
      { status: 400 },
    );
  }
}
