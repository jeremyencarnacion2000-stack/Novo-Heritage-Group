const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

async function listCreds() {
  const res = await fetch(`https://${N8N_URL}/api/v1/credentials`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const data = await res.json();
  console.log('=== AVAILABLE CREDENTIALS ===');
  if (data.data) {
    data.data.forEach(c => {
      console.log(`  id="${c.id}" name="${c.name}" type="${c.type}"`);
    });
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

listCreds();
