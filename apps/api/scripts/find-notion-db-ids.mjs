const API_KEY = 'process.env.NOTION_API_KEY || ""';
const PAGE_ID = '303367013518802e8ba2cf2829bf77aa';

async function fetchChildren(blockId) {
  const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Notion-Version': '2022-06-28'
    }
  });
  return res.json();
}

async function main() {
  const data = await fetchChildren(PAGE_ID);
  console.log('PAGE CHILDREN:');
  for (const block of data.results || []) {
    console.log(`- ${block.type}: ${block.id}`);
    if (block.type === 'child_database') {
      console.log(`  -> CHILD DB ID: ${block.id}`);
    }
    if (block.type === 'link_to_page' && block.link_to_page.type === 'database_id') {
      console.log(`  -> LINKED DB ID: ${block.link_to_page.database_id}`);
    }
    if (block.type === 'table') {
      const children = await fetchChildren(block.id);
      for (const c of children.results || []) {
        console.log(`  -> TABLE CHILD: ${c.type}: ${c.id}`);
      }
    }
  }
}

main().catch(console.error);
