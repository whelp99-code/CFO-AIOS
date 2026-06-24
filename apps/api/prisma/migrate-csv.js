const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const basePath = '/Users/jmpark/Playground/notion-export/개인 페이지 & 공유된 페이지';

function parseCSV(content) {
  const lines = content.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim().replace(/\r/g, ''));
  const rows = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].replace(/\r/g, '');
    if (!line.trim()) continue;
    
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim());
    
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = values[idx] || '';
    });
    rows.push(row);
  }
  
  return rows;
}

function parseKoreanDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (match) {
    return new Date(parseInt(match[1]), parseInt(match[2]) - 1, parseInt(match[3]));
  }
  return null;
}

function parseAmount(amountStr) {
  if (!amountStr) return 0;
  const cleaned = amountStr.replace(/[₩,원\s]/g, '');
  return parseFloat(cleaned) || 0;
}

async function main() {
  console.log('🚀 마이그레이션 시작...\n');

  // 1. 프로젝트 CSV 읽기
  const projectsCsvPath = path.join(basePath, 'CFO 대시보드/프로젝트 30336701351880219409cd1311c7f993.csv');
  const projectsCsv = fs.readFileSync(projectsCsvPath, 'utf-8');
  const projectRows = parseCSV(projectsCsv);
  
  console.log(`📁 프로젝트: ${projectRows.length}건`);
  
  // 프로젝트 데이터 정리 (이름 → ID 매핑)
  const projectMap = new Map();
  
  for (const row of projectRows) {
    const name = row['프로젝트명'] || row['이름'] || row['Name'] || '';
    if (!name) continue;
    
    const project = await prisma.project.create({
      data: {
        name: name.trim(),
        status: row['상태'] || row['Status'] || '진행전',
        client: row['거래처'] || row['Client'] || null,
      }
    });
    projectMap.set(name.trim(), project.id);
    console.log(`  ✓ ${name}`);
  }

  // 2. 매입 비용 CSV 읽기
  const expensesCsvPath = path.join(basePath, 'CFO 대시보드/매입 비용 DB 302367013518806da98cf696d7cb9402.csv');
  const expensesCsv = fs.readFileSync(expensesCsvPath, 'utf-8');
  const expenseRows = parseCSV(expensesCsv);
  
  console.log(`\n💰 매입 비용: ${expenseRows.length}건`);
  
  for (const row of expenseRows) {
    const projectName = (row['프로젝트'] || '').replace(/\s*\(https?:\/\/.*\)/, '').trim();
    const projectId = projectMap.get(projectName) || null;
    
    const expense = await prisma.expense.create({
      data: {
        projectId,
        expenseName: row['지출명'] || '제목 없음',
        supplier: row['매입처'] || null,
        category: row['구분'] || '기타',
        date: parseKoreanDate(row['일자']),
        supplyAmount: parseAmount(row['공급가액']),
        vat: parseAmount(row['VAT']),
        total: parseAmount(row['합계']),
        paymentMethod: row['결재수단'] || null,
        proofType: row['증빙'] || null,
        isPaid: (row['납입여부'] || '').toLowerCase() === 'yes',
      }
    });
    console.log(`  ✓ ${expense.expenseName} - ${expense.total.toLocaleString()}원`);
  }

  // 3. 자금흐름 CSV 읽기
  const cashflowCsvPath = path.join(basePath, 'CFO 대시보드/제목 없음 30336701351880b8a93dfb4e5f4b5b42.csv');
  const cashflowCsv = fs.readFileSync(cashflowCsvPath, 'utf-8');
  const cashflowRows = parseCSV(cashflowCsv);
  
  console.log(`\n💵 자금흐름: ${cashflowRows.length}건`);
  
  for (const row of cashflowRows) {
    const cashflow = await prisma.cashflow.create({
      data: {
        counterparty: row['거래처'] || row['제목'] || '제목 없음',
        amount: parseAmount(row['금액']),
        type: row['유형'] || '기타',
        outAccount: row['출금계좌'] || null,
        inAccount: row['입금계좌'] || null,
        date: parseKoreanDate(row['일자']),
        memo: row['메모'] || null,
        cashChange: parseAmount(row['현금변동']),
      }
    });
    console.log(`  ✓ ${cashflow.counterparty} - ${cashflow.amount.toLocaleString()}원`);
  }

  // 4. 미수금 CSV 읽기
  const invoicesCsvPath = path.join(basePath, 'CFO 대시보드/제목 없음 30336701351880a795c3ff6737a060e5.csv');
  const invoicesCsv = fs.readFileSync(invoicesCsvPath, 'utf-8');
  const invoiceRows = parseCSV(invoicesCsv);
  
  console.log(`\n📋 미수금: ${invoiceRows.length}건`);
  
  for (const row of invoiceRows) {
    const invoice = await prisma.invoice.create({
      data: {
        buyer: row['거래처'] || row[' buyer'] || null,
        amount: parseAmount(row['금액'] || row['합계']),
        depositAmount: parseAmount(row['입금액']),
        depositStatus: row['상태'] || '미수',
        depositDate: parseKoreanDate(row['입금일']),
        memo: row['메모'] || null,
      }
    });
    console.log(`  ✓ ${invoice.buyer || '제목 없음'} - ${(invoice.amount || 0).toLocaleString()}원`);
  }

  console.log('\n✅ 마이그레이션 완료!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
