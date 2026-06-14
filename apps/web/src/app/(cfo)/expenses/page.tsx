import { cfoFetch, formatKrw } from "@/lib/cfo-client";

type Expense = {
  id: string;
  expenseName: string;
  category: string;
  supplierCost: number | null;
  total: number | null;
  isPaid: boolean;
  date: string | null;
};

export default async function ExpensesPage() {
  let expenses: Expense[] = [];
  let error: string | null = null;
  try {
    expenses = await cfoFetch<Expense[]>("expenses?limit=50");
  } catch (e: unknown) {
    error = e instanceof Error ? e.message : "API 오류";
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">매입 / 비용</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="overflow-x-auto rounded-lg border bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-zinc-50 text-left">
              <th className="p-3">지출명</th>
              <th className="p-3">구분</th>
              <th className="p-3">금액</th>
              <th className="p-3">납입</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} className="border-b">
                <td className="p-3">{e.expenseName}</td>
                <td className="p-3">{e.category}</td>
                <td className="p-3">{formatKrw(e.total ?? 0)}</td>
                <td className="p-3">{e.isPaid ? "완료" : "미납"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
