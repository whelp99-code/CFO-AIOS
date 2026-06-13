const API_KEY = 'process.env.NOTION_API_KEY || ""';

const ALL_DB_IDS = [
  ['프로젝트', '30336701-3518-8021-9409-cd1311c7f993'],
  ['DB2 (알수없음)', '30336701-3518-80a7-95c3-ff6737a060e5'],
  ['DB3 (알수없음)', '30336701-3518-8004-8d3a-e56bfc752acd'],
  ['자금흐름', '30336701-3518-80b8-a93d-fb4e5f4b5b42'],
  ['매입/비용', '30236701-3518-806d-a98c-f696d7cb9402'],
];

async function queryDb(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page_size: 5 })
  });
  return res.json();
}

async function main() {
  console.log('=== CFO 페이지 내 모든 자식 DB 접근 테스트 ===\n');
  
  for (const [name, id] of ALL_DB_IDS) {
    const data = await queryDb(id);
    if (data.results) {
      console.log(`✅ ${name}: ${data.results.length}개 레코드 접근 가능`);
    } else if (data.status === 400) {
      console.log(`⚠️ ${name}: ${data.message || '데이터 소스 접근 불가'}`);
    } else if (data.status === 404) {
      console.log(`❌ ${name}: 데이터베이스를 찾을 수 없음`);
    } else {
      console.log(`❓ ${name}: ${JSON.stringify(data)}`);
    }
  }
  
  console.log('\n=== CFO 페이지 Child Database ID 목록 ===');
  for (const [name, id] of ALL_DB_IDS) {
    console.log(`${name}: ${id}`);
  }
  
  console.log('\n\n💡 해결 방법:');
  console.log('1. CRM(DB2)과 현금흐름(DB3)이 어떤 DB인지 확인하려면 Notion에서 열어보세요.');
  console.log('2. 프로젝트/미수금/자금흐름 DB에 아래 connection을 추가하세요:');
  console.log('   Share → Add connections → CFO1 선택 → Confirm');
}

main().catch(console.error);
