const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

// Quick test: try to call SambaNova with each Header Auth credential
// to see which one has the right API key

async function testCred(credId, credName) {
  // We can't read the credential values via API, but we CAN test them
  // by checking what the credential is used for.
  // Let's check the credential details
  const res = await fetch(`https://${N8N_URL}/api/v1/credentials/${credId}`, {
    headers: { 'X-N8N-API-KEY': API_KEY }
  });
  const data = await res.json();
  console.log(`\n=== ${credName} (${credId}) ===`);
  console.log(JSON.stringify(data, null, 2));
}

async function main() {
  await testCred('KwSuSbN8o5BztaZX', 'Header Auth account 3');
  await testCred('u46bitcJQIW1QNfu', 'Header Auth account 2');
  await testCred('IkaWMm84J2TGL1ZE', 'Header Auth account');
}

main();
