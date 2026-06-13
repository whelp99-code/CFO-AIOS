const API_KEY = 'process.env.NOTION_API_KEY || ""';

async function getDb(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28'
    }
  });
  return res.json();
}

async function main() {
  for (const [name, id] of [
    ['프로젝트', '30336701351880219409cd1311c7f993'],
    ['미수금/입금관리', '3023670135188041896edcd7eab0556b'],
    ['자금흐름', '30236701351880f98ebdc6bf8b647f9b'],
  ]) {
    const data = await getDb(id);
    console.log(`\n=== ${name} (${id}) ===`);
    console.log('Status:', data.status || 'OK');
    if (data.message) console.log('Message:', data.message);
    if (data.title) console.log('Title:', data.title?.[0]?.plain_text);
    if (data.properties) console.log('Properties:', Object.keys(data.properties));
  }
}

main().catch(console.error);
