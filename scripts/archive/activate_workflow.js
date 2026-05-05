const https = require('https');

const HOST = 'suskj501-n8n.hf.space';
const AUTH_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiZWI4YzU0ODQtN2E2MC00YWI5LThlYjctNGYyOTQ4OTYxMjliIiwiaWF0IjoxNzc1MjAxNTMwfQ.p8b5d_t_BqEhcNbAg3bPaUZj46cWEQEIlFHycvLBlUU';
const wfID = 'nkp8BcGXisFl9HAN';

async function activate() {
  const data = JSON.stringify({ active: true });
  console.log(`Activating workflow ${wfID} via PATCH...`);
  
  const options = {
    hostname: HOST,
    path: `/api/v1/workflows/${wfID}`,
    method: 'PATCH',
    headers: {
      'X-N8N-API-KEY': AUTH_KEY,
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };

  const req = https.request(options, (res) => {
    let body = '';
    res.on('data', (d) => body += d);
    res.on('end', () => {
      console.log('Status:', res.statusCode);
      console.log('Body:', body);
    });
  });

  req.on('error', console.error);
  req.write(data);
  req.end();
}

activate();
