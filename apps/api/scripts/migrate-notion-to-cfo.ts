/**
 * Notion Data Migration Script
 * 
 * 실행 방법:
 * 1. DATABASE_URL 환경변수 설정 확인
 * 2. npx prisma migrate dev --name add_notion_fields
 * 3. ts-node scripts/migrate-notion-to-cfo.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 노션 API 설정
const NOTION_API_KEY = process.env.NOTION_API_KEY || '';
const NOTION_VERSION = '2022-06-28';

// 노션 데이터베이스 ID
const DATABASE_IDS = {
  PROJECTS: '30336701351880219409cd1311c7f993',
  INVOICES: '3023670135188041896edcd7eab0556b', // 미수금/입금관리
  EXPENSES: '302367013518806da98cf696d7cb9402', // 매입/비용 DB
  CASHFLOW: '30236701351880f98ebdc6bf8b647f9b', // 자금흐름 DB
};

async function clearExistingData() {
  console.log('기존 데이터 삭제 중...');
  
  // 외래키 제약으로 인해 순서대로 삭제
  await prisma.cashflow.deleteMany({});
  await prisma.expense.deleteMany({});
  await prisma.invoice.deleteMany({});
  await prisma.project.deleteMany({});
  
  console.log('기존 데이터 삭제 완료');
}

async function notionRequest(endpoint: string) {
  const response = await fetch(`https://api.notion.com/v1${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': NOTION_VERSION,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Notion API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function queryDatabase(databaseId: string) {
  const allResults: any[] = [];
  let hasMore = true;
  let nextCursor: string | null = null;

  while (hasMore) {
    const response = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        page_size: 100,
        start_cursor: nextCursor || undefined,
      }),
    });

    if (!response.ok) {
      console.error(`Database query failed: ${databaseId}`, await response.text());
      break;
    }

    const data = await response.json();
    allResults.push(...data.results);
    
    hasMore = data.has_more;
    nextCursor = data.next_cursor;

    if (data.results.length === 0) break;
  }

  return allResults;
}

// 날짜 문자열 파싱
function parseDate(dateStr: string | undefined): Date | null {
  if (!dateStr) return null;
  try {
    return new Date(dateStr);
  } catch {
    return null;
  }
}

// 숫자 추출
function parseNumber(value: any): number | undefined {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const cleaned = value.replace(/[^0-9.-]/g, '');
    return cleaned ? parseFloat(cleaned) : undefined;
  }
  return undefined;
}

// 프로젝트 마이그레이션
async function migrateProjects() {
  console.log('프로젝트 데이터 마이그레이션 중...');
  
  const projects = await queryDatabase(DATABASE_IDS.PROJECTS);
  console.log(`조회된 프로젝트: ${projects.length}개`);

  for (const page of projects) {
    const props = page.properties;
    
    try {
      await prisma.project.create({
        data: {
          notionId: page.id,
          name: props['프로젝트']?.title?.[0]?.plain_text || '무제',
          status: props['진행상태']?.select?.name || '진행전',
          client: props['거래처']?.rich_text?.[0]?.plain_text || null,
          startDate: parseDate(props['시작일']?.date?.start),
          endDate: parseDate(props['종료일']?.date?.start),
        },
      });
    } catch (error) {
      console.error(`프로젝트 생성 실패 (${page.id}):`, error);
    }
  }

  console.log(`프로젝트 ${projects.length}개 마이그레이션 완료`);
}

// 미수금/입금관리 마이그레이션
async function migrateInvoices() {
  console.log('미수금/입금관리 데이터 마이그레이션 중...');
  
  const invoices = await queryDatabase(DATABASE_IDS.INVOICES);
  console.log(`조회된 입금: ${invoices.length}개`);

  for (const page of invoices) {
    const props = page.properties;
    
    try {
      // 프로젝트 관계 조회
      const projectName = props['거래처']?.rollup?.array?.[0]?.title?.[0]?.plain_text;
      const project = projectName 
        ? await prisma.project.findFirst({ where: { name: projectName } })
        : null;

      await prisma.invoice.create({
        data: {
          notionId: page.id,
          projectId: project?.id || null,
          supplierCost: parseNumber(props['공급가액']?.number),
          depositAmount: parseNumber(props['입금액']?.number),
          depositStatus: props['입금상태']?.select?.name || '미수',
          depositDate: parseDate(props['입금일']?.date?.start),
          memo: props['메모']?.rich_text?.[0]?.plain_text || null,
        },
      });
    } catch (error) {
      console.error(`입금 데이터 생성 실패 (${page.id}):`, error);
    }
  }

  console.log(`입금 ${invoices.length}개 마이그레이션 완료`);
}

// 매입/비용 DB 마이그레이션
async function migrateExpenses() {
  console.log('매입/비용 데이터 마이그레이션 중...');
  
  const expenses = await queryDatabase(DATABASE_IDS.EXPENSES);
  console.log(`조회된 지출: ${expenses.length}개`);

  for (const page of expenses) {
    const props = page.properties;
    
    try {
      // 프로젝트 관계 조회
      const projectRelation = props['프로젝트']?.relation;
      let projectId = null;
      if (projectRelation && projectRelation.length > 0) {
        const project = await prisma.project.findFirst({
          where: { notionId: projectRelation[0].id },
        });
        projectId = project?.id || null;
      }

      await prisma.expense.create({
        data: {
          notionId: page.id,
          projectId: projectId,
          expenseName: props['지출명']?.title?.[0]?.plain_text || '무제',
          supplierCost: parseNumber(props['공급가액']?.number),
          category: props['구분']?.select?.name || '기타',
          vendor: props['매입처']?.rich_text?.[0]?.plain_text || null,
          date: parseDate(props['일자']?.date?.start),
          proofType: props['증빙']?.select?.name || '없음',
          paymentMethod: props['결재수단']?.select?.name || null,
          isPaid: props['납입여부']?.checkbox || false,
        },
      });
    } catch (error) {
      console.error(`지출 데이터 생성 실패 (${page.id}):`, error);
    }
  }

  console.log(`지출 ${expenses.length}개 마이그레이션 완료`);
}

// 자금흐름 DB 마이그레이션
async function migrateCashflows() {
  console.log('자금흐름 데이터 마이그레이션 중...');
  
  const cashflows = await queryDatabase(DATABASE_IDS.CASHFLOW);
  console.log(`조회된 거래: ${cashflows.length}개`);

  for (const page of cashflows) {
    const props = page.properties;
    
    try {
      // 프로젝트 관계 조회
      const projectRelation = props['프로젝트']?.relation;
      let projectId = null;
      if (projectRelation && projectRelation.length > 0) {
        const project = await prisma.project.findFirst({
          where: { notionId: projectRelation[0].id },
        });
        projectId = project?.id || null;
      }

      await prisma.cashflow.create({
        data: {
          notionId: page.id,
          projectId: projectId,
          counterparty: props['거래처']?.title?.[0]?.plain_text || '무제',
          amount: parseNumber(props['금액']?.number) || 0,
          type: props['유형']?.select?.name || '기타',
          outAccount: props['출금계좌']?.select?.name || null,
          inAccount: props['입금계좌']?.select?.name || null,
          date: parseDate(props['일자']?.date?.start),
          memo: props['메모']?.rich_text?.[0]?.plain_text || null,
        },
      });
    } catch (error) {
      console.error(`자금흐름 데이터 생성 실패 (${page.id}):`, error);
    }
  }

  console.log(`자금흐름 ${cashflows.length}개 마이그레이션 완료`);
}

// 메인 실행
async function main() {
  console.log('=== CFO 데이터 Notion 마이그레이션 시작 ===');
  
  if (!NOTION_API_KEY) {
    console.error('❌ NOTION_API_KEY 환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  try {
    // 1. 기존 데이터 삭제
    await clearExistingData();

    // 2. 프로젝트 먼저 마이그레이션 (참조 관계가 있으므로)
    await migrateProjects();

    // 3. 나머지 데이터 마이그레이션
    await migrateInvoices();
    await migrateExpenses();
    await migrateCashflows();

    console.log('=== 마이그레이션 완료 ===');
  } catch (error) {
    console.error('마이그레이션 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
