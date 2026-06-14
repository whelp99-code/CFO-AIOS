import { cfoFetch, formatKrw } from "@/lib/cfo-client";

type Invoice = {
  id: string;
  buyer: string | null;
  supplierCost: number | null;
  vat: number | null;
  total: number | null;
  depositStatus: string;
  depositDate: string | null;
};

export default async function InvoicesPage() {
  let invoices: Invoice[] = [];
  let error: string | null = null;
  try {
    invoices = await cfoFetch<Invoice[]>("invoices?limit=50");
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "API 오류";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">미수금 / 인보이스</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="p-3">거래처</th>
              <th className="p-3">공급가</th>
              <th className="p-3">합계</th>
              <th className="p-3">입금상태</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-b">
                <td className="p-3">{inv.buyer ?? "-"}</td>
                <td className="p-3">{formatKrw(inv.supplierCost ?? 0)}</td>
                <td className="p-3">{formatKrw(inv.total ?? 0)}</td>
                <td className="p-3">{inv.depositStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
