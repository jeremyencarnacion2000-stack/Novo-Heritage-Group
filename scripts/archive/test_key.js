const https = require('https');

const NEW_KEY = '6295ae62-0920-4172-abc8-9548092ac526';

const models = [
  'Meta-Llama-3.3-70B-Instruct',
  'Meta-Llama-3.1-8B-Instruct',
  'Meta-Llama-3.1-405B-Instruct'
];

async function probe() {
  for (const model of models) {
    console.log(`--- PROBING MODEL: ${model} ---`);
    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Di OK si recibes esto.' }],
      max_tokens: 10
    });
    
    // logic... (simplifying for multi_replace)
  }
}

const options = {
  hostname: 'api.sambanova.ai',
  path: '/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${NEW_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log('--- TESTING NEW SAMBANOVA KEY ---');
const req = https.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', body);
    if (res.statusCode === 200) console.log('✅ KEY VALIDATED SUCCESSFULLY');
    else console.log('❌ KEY VALIDATION FAILED');
  });
});

req.on('error', (e) => {
  console.error('Connection Error:', e.message);
});

req.write(data);
req.end();
