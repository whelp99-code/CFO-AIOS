import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.expense.deleteMany();
    await prisma.cashflow.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.project.deleteMany();
    console.log('기존 데이터 삭제 완료');

    // 1. 프로젝트 개별 CSV (모두 개별 row)
    await importProjects();

    // 2. 미수금 입금관리 (Invoice)
    await importInvoices();

    // 3. 매입 비용 DB (Expense) - all 사용
    await importExpenses();

    // 4. 자금흐름 DB (Cashflow)
    await importCashflows();

    console.log('모든 데이터 임포트 완료');
  } catch (e: any) {
    console.error('Import error:', e?.message || e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

function parseKoreanDate(str: string): Date | null {
  if (!str || str.trim() === '') return null;
  const m = str.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (m) {
    return new Date(+m[1], +m[2] - 1, +m[3]);
  }
  return null;
}

function parseAmount(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[₩,\s]/g, '');
  const n = Number(cleaned);
  return isNaN(n) ? 0 : n;
}

function parseYesNo(val: string): boolean {
  return val === 'Yes' || val === 'YES' || val === 'yes' || val === 'Y';
}

function parseCsv(filePath: string): string[][] {
  let text = fs.readFileSync(filePath, 'utf-8');
  // Strip BOM if present
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
  return lines.map(line => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    // 마지막에 빈 필드 추가 (trailing comma)
    while (result.length < 20) {
      result.push('');
    }
    return result;
  });
}

function findFile(nameContains: string): string | null {
  const dir = process.env.NOTION_EXPORT_DIR ?? '/Users/jmpark/Downloads/notion-export';
  if (!fs.existsSync(dir)) {
    console.error(`❌ 디렉터리가 없습니다: ${dir}`);
    console.error('   환경변수 NOTION_EXPORT_DIR로 노션 export CSV 위치를 지정하세요.');
    return null;
  }
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    if (entry.includes(nameContains) && entry.endsWith('.csv')) {
      return path.join(dir, entry);
    }
  }
  return null;
}

async function importProjects() {
  const filePath = findFile('프로젝트');
  if (!filePath) {
    console.log('프로젝트 CSV not found');
    return;
  }
  const rows = parseCsv(filePath);
  const header = rows[0];
  const idx: Record<string, number> = {};
  header.forEach((h, i) => { idx[h] = i; });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[idx['프로젝트명(Title)']]) continue;

    const name = row[idx['프로젝트명(Title)']];
    const status = row[idx['상태']] || '진행';
    const startDateStr = row[idx['시작일']] || '';
    const endDateStr = row[idx['종료일']] || '';

    await prisma.project.create({
      data: {
        name,
        status,
        client: row[idx['거래']] || null,
        startDate: parseKoreanDate(startDateStr),
        endDate: parseKoreanDate(endDateStr),
      },
    });
  }
  console.log('프로젝트 import 완료');
}

async function importInvoices() {
  const filePath = findFile('미수금 입금관리');
  if (!filePath) {
    console.log('미수금 CSV not found');
    return;
  }
  const rows = parseCsv(filePath);
  const header = rows[0];
  const idx: Record<string, number> = {};
  header.forEach((h, i) => { idx[h] = i; });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[idx['거래처']]) continue;

    const projectName = row[idx['프로젝트']] || '';
    const projectNameClean = projectName.split(' (')[0].trim();
    let project = null;
    if (projectNameClean) {
      project = await prisma.project.findFirst({ where: { name: { contains: projectNameClean } } });
    }

    await prisma.invoice.create({
      data: {
        projectId: project?.id || null,
        buyer: row[idx['거래처']],
        supplierCost: parseAmount(row[idx['공급가액']] || ''),
        vat: parseAmount(row[idx['VAT']] || ''),
        total: parseAmount(row[idx['합계']] || ''),
        depositAmount: parseAmount(row[idx['입금액']] || ''),
        depositStatus: row[idx['입금상태']] || '미수',
        depositDate: parseKoreanDate(row[idx['입금일']] || ''),
        memo: row[idx['메모']] || null,
      },
    });
  }
  console.log('미수금(Invoice) import 완료');
}

async function importExpenses() {
  const filePath = findFile('매입 비용 DB');
  if (!filePath) {
    console.log('매입 비용 CSV not found');
    return;
  }
  const rows = parseCsv(filePath);
  const header = rows[0];
  const idx: Record<string, number> = {};
  header.forEach((h, i) => { idx[h] = i; });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[idx['지출명']] || row[idx['지출명']].trim() === '') continue;

    const projectName = row[idx['프로젝트']] || '';
    const projectNameClean = projectName.split(' (')[0].trim();
    let project = null;
    if (projectNameClean) {
      project = await prisma.project.findFirst({ where: { name: { contains: projectNameClean } } });
    }

    await prisma.expense.create({
      data: {
        projectId: project?.id || null,
        expenseName: row[idx['지출명']],
        vendor: row[idx['매입처']] || null,
        category: row[idx['구분']] || '기타',
        supplierCost: parseAmount(row[idx['공급가액']] || ''),
        vat: parseAmount(row[idx['VAT']] || ''),
        total: parseAmount(row[idx['합계']] || ''),
        date: parseKoreanDate(row[idx['일자']] || ''),
        proofType: row[idx['증빙']] || null,
        paymentMethod: row[idx['결재수단']] || null,
        isPaid: parseYesNo(row[idx['납입여부']] || ''),
        attachment: row[idx['첨부파일']] || null,
      },
    });
  }
  console.log('매입비용(Expense) import 완료');
}

async function importCashflows() {
  const filePath = findFile('자금흐름 DB');
  if (!filePath) {
    console.log('자금흐름 CSV not found');
    return;
  }
  const rows = parseCsv(filePath);
  const header = rows[0];
  const idx: Record<string, number> = {};
  header.forEach((h, i) => { idx[h] = i; });

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row[idx['유형']]) continue;

    const projectName = row[idx['프로젝트']] || '';
    const projectNameClean = projectName.split(' (')[0].trim();
    let project = null;
    if (projectNameClean) {
      project = await prisma.project.findFirst({ where: { name: { contains: projectNameClean } } });
    }

    if (!project) {
      await prisma.cashflow.create({
        data: {
          counterparty: row[idx['거래처']] || '미상',
          amount: parseAmount(row[idx['금액']] || ''),
          type: row[idx['유형']] || '기타',
          date: parseKoreanDate(row[idx['일자']] || ''),
          memo: row[idx['메모']] || null,
          outAccount: row[idx['출금계좌']] || null,
          inAccount: row[idx['입금계좌']] || null,
        },
      });
    } else {
      await prisma.cashflow.create({
        data: {
          project: { connect: { id: project.id } },
          counterparty: row[idx['거래처']] || '미상',
          amount: parseAmount(row[idx['금액']] || ''),
          type: row[idx['유형']] || '기타',
          date: parseKoreanDate(row[idx['일자']] || ''),
          memo: row[idx['메모']] || null,
          outAccount: row[idx['출금계좌']] || null,
          inAccount: row[idx['입금계좌']] || null,
        },
      });
    }
  }
  console.log('자금흐름(Cashflow) import 완료');
}

main();
