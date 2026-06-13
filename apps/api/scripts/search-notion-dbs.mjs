const API_KEY = 'process.env.NOTION_API_KEY || ""';

async function searchDb(query) {
  const res = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: query, filter: { value: 'database', property: 'object' } })
  });
  return res.json();
}

async function main() {
  for (const term of ['프로젝트', '미수금', '매입', '자금']) {
    const data = await searchDb(term);
    console.log(`\n=== ${term} ===`);
    for (const item of data.results || []) {
      console.log(`ID: ${item.id}`);
      console.log(`Title: ${item.title?.[0]?.plain_text || 'N/A'}`);
      console.log('---');
    }
  }
}

main().catch(console.error);
