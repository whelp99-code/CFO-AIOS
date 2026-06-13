/**
 * Notion Data Migration Script (Partial)
 * 현재 CFO1이 접근 가능한 매입/비용 DB만 동기화
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const NOTION_API_KEY = 'process.env.NOTION_API_KEY || ""';
const NOTION_VERSION = '2022-06-28';

// 현재 접근 가능한 DB ID
const EXPENSE_DB_ID = '302367013518806da98cf696d7cb9402';

async function clearExistingData() {
  console.log('기존 데이터 삭제 중...');
  await prisma.expense.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.cashflow.deleteMany({});
  console.log('기존 데이터 삭제 완료');
}

async function queryDatabase(databaseId, pageSize = 100) {
  const allResults = [];
  let hasMore = true;
  let nextCursor = null;

  while (hasMore) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: pageSize,
        start_cursor: nextCursor || undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error(`DB query failed (${databaseId}):`, error.message || error.code);
      break;
    }

    const data = await response.json();
    allResults.push(...(data.results || []));
    
    hasMore = data.has_more;
    nextCursor = data.next_cursor;

    if (!data.results || data.results.length === 0) break;
    
    console.log(`  Fetched ${data.results.length} records (total: ${allResults.length})`);
  }

  return allResults;
}

function parseDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch { return null; }
}

function parseNumber(value) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    return cleaned ? parseFloat(cleaned) : undefined;
  }
  return undefined;
}

async function migrateExpenses() {
  console.log('\n매입/비용 DB 마이그레이션 시작...');
  
  const expenses = await queryDatabase(EXPENSE_DB_ID);
  console.log(`총 ${expenses.length}개 레코드 조회됨`);

  for (const page of expenses) {
    const props = page.properties;
    
    try {
      await prisma.expense.create({
        data: {
          notionId: page.id,
          expenseName: props['지출명']?.title?.[0]?.text?.content || '무제',
          supplierCost: parseNumber(props['공급가액']?.number),
          category: props['구분']?.select?.name || '기타',
          vendor: props['매입처']?.rich_text?.[0]?.text?.content || null,
          date: parseDate(props['일자']?.date?.start),
          proofType: props['증빙']?.select?.name || '없음',
          paymentMethod: props['결재수단']?.select?.name || null,
          isPaid: props['납입여부']?.checkbox || false,
        },
      });
    } catch (error) {
      console.error(`지출 생성 실패 (${page.id}):`, error.message);
    }
  }

  console.log(`매입/비용 ${expenses.length}개 마이그레이션 완료`);
}

async function main() {
  console.log('=== Notion CFO 부분 마이그레이션 시작 ===');
  
  try {
    await clearExistingData();
    await migrateExpenses();
    
    console.log('\n=== 마이그레이션 완료 ===');
    console.log('참고: 프로젝트/미수금/자금흐름 DB는 CFO1 권한이 없어 제외됨');
    console.log('나머지 DB를 동기화하려면 Notion Share에서 CFO1을 추가하세요.');
  } catch (error) {
    console.error('마이그레이션 중 오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
