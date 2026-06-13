const API_KEY = 'process.env.NOTION_API_KEY || ""';

async function getAllAccessibleDbs() {
  const res = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      filter: { value: 'database', property: 'object' },
      page_size: 100
    })
  });
  return res.json();
}

async function main() {
  const data = await getAllAccessibleDbs();
  console.log(`Found ${data.results?.length || 0} accessible databases:\n`);
  
  for (const db of data.results || []) {
    console.log(`ID: ${db.id}`);
    console.log(`Name: ${db.title?.[0]?.plain_text || 'N/A'}`);
    console.log(`URL: ${db.url}`);
    console.log('Properties:', Object.keys(db.properties || {}).join(', '));
    console.log('---');
  }
}

main().catch(console.error);
