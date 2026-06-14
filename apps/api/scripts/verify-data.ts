import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const paid = await p.invoice.aggregate({ where: { depositStatus: '완료' }, _sum: { supplierCost: true, vat: true }, _count: true });
  const exp = await p.expense.aggregate({ where: { isPaid: true }, _sum: { supplierCost: true, vat: true }, _count: true });
  const out = await p.invoice.aggregate({ where: { depositStatus: { not: '완료' } }, _sum: { supplierCost: true, vat: true }, _count: true });
  const revenue = (paid._sum.supplierCost ?? 0) + (paid._sum.vat ?? 0);
  const expense = (exp._sum.supplierCost ?? 0) + (exp._sum.vat ?? 0);
  const outstanding = (out._sum.supplierCost ?? 0) + (out._sum.vat ?? 0);
  console.log('=== 대시보드 KPI (전체 데이터) ===');
  console.log(`총 매출: ${Math.round(revenue).toLocaleString()}원 (${paid._count}건)`);
  console.log(`총 지출: ${Math.round(expense).toLocaleString()}원 (${exp._count}건)`);
  console.log(`순이익: ${Math.round(revenue - expense).toLocaleString()}원`);
  console.log(`미수금: ${Math.round(outstanding).toLocaleString()}원 (${out._count}건)`);
  console.log(`부가세 추정: ${Math.round(Math.max(0, (paid._sum.vat ?? 0) - (exp._sum.vat ?? 0))).toLocaleString()}원`);

  // 샘플 인보이스
  const sample = await p.invoice.findFirst({ include: { project: true } });
  console.log('\n=== 샘플 인보이스 ===');
  console.log(JSON.stringify(sample, null, 2));

  // 부가세 계산
  console.log('\n=== 2026년 1기 부가세 ===');
  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 5, 30, 23, 59, 59);
  const salesTax = await p.taxInvoice.aggregate({ where: { direction: 'sales', issueDate: { gte: start, lte: end } }, _sum: { vatAmount: true, supplyAmount: true } });
  const purchaseTax = await p.taxInvoice.aggregate({ where: { direction: 'purchase', issueDate: { gte: start, lte: end } }, _sum: { vatAmount: true, supplyAmount: true } });
  console.log(`매출 세액: ${(salesTax._sum.vatAmount ?? 0).toLocaleString()}원`);
  console.log(`매입 세액: ${(purchaseTax._sum.vatAmount ?? 0).toLocaleString()}원`);
  console.log(`납부할 세액: ${Math.max(0, (salesTax._sum.vatAmount ?? 0) - (purchaseTax._sum.vatAmount ?? 0)).toLocaleString()}원`);

  await p.$disconnect();
}
main();
