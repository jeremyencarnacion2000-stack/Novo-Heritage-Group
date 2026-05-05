const https = require('https');

const NEW_KEY = '6295ae62-0920-4172-abc8-9548092ac526';
const models = [
  'Meta-Llama-3.3-70B-Instruct',
  'Meta-Llama-3.1-405B-Instruct',
  'Meta-Llama-3.1-70B-Instruct',
  'Meta-Llama-3.1-8B-Instruct'
];

async function testModel(model) {
  return new Promise((resolve) => {
    console.log(`Testing model: ${model}...`);
    const data = JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: 'Di OK si recibes esto.' }],
      max_tokens: 10
    });

    const req = https.request({
      hostname: 'api.sambanova.ai',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NEW_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    }, (res) => {
      let body = '';
      res.on('data', (d) => body += d);
      res.on('end', () => {
        resolve({ model, status: res.statusCode, body });
      });
    });
    req.on('error', (e) => resolve({ model, status: 'ERROR', error: e.message }));
    req.write(data);
    req.end();
  });
}

async function main() {
  console.log('--- PROBING SAMBANOVA CLOUD MODELS ---');
  for (const model of models) {
    const result = await testModel(model);
    console.log(`- ${model}: Status ${result.status}`);
    if (result.status === 200) {
      console.log('✅ SUCCESSFUL MODEL FOUND!');
      console.log('Response:', result.body);
      process.exit(0);
    }
  }
}

main();
