const N8N_URL = 'suskj501-n8n.hf.space';
const API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';

async function cleanup() {
  try {
    const response = await fetch(`https://${N8N_URL}/api/v1/workflows`, {
      headers: { 'X-N8N-API-KEY': API_KEY }
    });
    const data = await response.json();
    
    if (!data.data) {
      console.log('Error fetching workflows:', data);
      return;
    }

    const workflows = data.data;
    console.log(`Found ${workflows.length} workflows.`);

    // Find all workflows with "Ingestor Multimedia" in the name
    const matches = workflows.filter(w => w.name.includes('Ingestor Multimedia'));
    
    if (matches.length === 0) {
      console.log('No multimedia workflows found.');
      return;
    }

    // Sort by updated date, keep the newest one (or the one the user is using)
    matches.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    const keep = matches[0];
    const toDelete = matches.slice(1);

    console.log(`Keeping: ${keep.name} (ID: ${keep.id})`);

    // Delete duplicates
    for (const w of toDelete) {
      console.log(`Deleting duplicate: ${w.name} (ID: ${w.id})...`);
      await fetch(`https://${N8N_URL}/api/v1/workflows/${w.id}`, {
        method: 'DELETE',
        headers: { 'X-N8N-API-KEY': API_KEY }
      });
    }

    console.log('Cleanup complete.');
  } catch (err) {
    console.error('Fatal error:', err.message);
  }
}

cleanup();
