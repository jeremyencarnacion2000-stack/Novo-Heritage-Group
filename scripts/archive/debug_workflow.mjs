const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const WORKFLOW_ID = 'tNfL2APn3vXKgTea';

async function debug() {
  const res = await fetch(`https://${N8N_URL}/api/v1/workflows/${WORKFLOW_ID}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const wf = await res.json();

  console.log('=== NODES ===');
  wf.nodes.forEach(n => {
    console.log(`  [${n.type}] name="${n.name}" id="${n.id}" pos=[${n.position}]`);
    if (n.parameters) {
      // Show key params
      if (n.parameters.values) console.log('    values:', JSON.stringify(n.parameters.values, null, 2));
      if (n.parameters.bodyInput) console.log('    bodyInput:', n.parameters.bodyInput.substring(0, 200));
      if (n.parameters.specifyBody) console.log('    specifyBody:', n.parameters.specifyBody);
      if (n.parameters.url) console.log('    url:', n.parameters.url);
      if (n.parameters.query) console.log('    query:', typeof n.parameters.query === 'string' ? n.parameters.query.substring(0, 200) : JSON.stringify(n.parameters.query));
    }
  });

  console.log('\n=== CONNECTIONS ===');
  Object.entries(wf.connections).forEach(([src, conn]) => {
    if (conn.main) {
      conn.main.forEach((outputs, outIdx) => {
        outputs.forEach(target => {
          console.log(`  "${src}" [output ${outIdx}] → "${target.node}" [input ${target.index || 0}]`);
        });
      });
    }
  });
}

debug();
