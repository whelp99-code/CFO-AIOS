const API_KEY = 'process.env.NOTION_API_KEY || ""';

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
  const data = await fetchChildren('303367013518802e8ba2cf2829bf77aa');
  console.log(`CFO 대시보드 하위 ${data.results?.length || 0}개 블록:`);
  
  for (const block of (data.results || [])) {
    console.log(`\n- Type: ${block.type}, ID: ${block.id}`);
    if (block.type === 'child_database') {
      console.log(`  -> CHILD DATABASE ID: ${block.id}`);
    }
    if (block.type === 'link_to_page' && block.link_to_page?.type === 'page_id') {
      console.log(`  -> LINKED PAGE ID: ${block.link_to_page.page_id}`);
    }
    if (block.type === 'column_list') {
      const cols = await fetchChildren(block.id);
      for (const col of (cols.results || [])) {
        const colChildren = await fetchChildren(col.id);
        for (const child of (colChildren.results || [])) {
          console.log(`    -> Col Child: ${child.type}, ID: ${child.id}`);
          if (child.type === 'child_database') {
            console.log(`        >>> CHILD DB ID: ${child.id}`);
          }
        }
      }
    }
  }
}

main().catch(console.error);
