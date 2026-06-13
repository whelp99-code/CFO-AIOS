const API_KEY = 'process.env.NOTION_API_KEY || ""';

async function testDb(dbId) {
  const res = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ page_size: 5 })
  });
  const data = await res.json();
  console.log(`DB ${dbId}: ${data.results ? data.results.length : 'ERROR'} records`);
  if (data.status) console.log('Status:', data.status, data.message);
  return data;
}

async function main() {
  console.log('Project DB:');
  await testDb('30336701351880219409cd1311c7f993');
  
  console.log('\nInvoice DB:');
  await testDb('3023670135188041896edcd7eab0556b');
  
  console.log('\nExpense DB:');
  await testDb('302367013518806da98cf696d7cb9402');
  
  console.log('\nCashflow DB:');
  await testDb('30236701351880f98ebdc6bf8b647f9b');
}

main().catch(console.error);
