const API_KEY = 'process.env.NOTION_API_KEY || ""';

// 하이픈이 있는 ID로 직접 테스트
const DB_IDS = [
  ['프로젝트', '30336701-3518-8021-9409-cd1311c7f993'],
  ['미수금/입금관리', '30336701-3518-80a7-95c3-ff6737a060e5'],
  ['자금흐름', '30336701-3518-80b8-a93d-fb4e5f4b5b42'],
];

async function queryDb(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page_size: 100 })
  });
  return res.json();
}

async function main() {
  for (const [name, id] of DB_IDS) {
    console.log(`\n=== ${name} (${id}) ===`);
    const data = await queryDb(id);
    if (data.results) {
      console.log(`✅ 성공! ${data.results.length}개 레코드`);
      if (data.results.length > 0) {
        const r = data.results[0];
        console.log(`  First record ID: ${r.id}`);
        console.log(`  URL: ${r.url}`);
      }
    } else {
      console.log(`❌ 실패: ${data.status || 'UNKNOWN'} - ${data.message || JSON.stringify(data)}`);
    }
  }
}

main().catch(console.error);
