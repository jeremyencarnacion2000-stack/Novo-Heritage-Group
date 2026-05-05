const { Client } = require('pg');

async function run() {
  const c = new Client({
    connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'
  });
  await c.connect();

  // Message type distribution
  console.log('=== MESSAGE TYPES ===');
  const types = await c.query(`
    SELECT "messageType", COUNT(*) as cnt 
    FROM evolution."Message" 
    GROUP BY "messageType" 
    ORDER BY cnt DESC LIMIT 15
  `);
  for (const r of types.rows) {
    console.log(`  ${r.messageType || 'NULL'}: ${r.cnt}`);
  }

  // Sample image messages
  console.log('\n=== IMAGE MESSAGES (sample) ===');
  const imgs = await c.query(`
    SELECT id, "messageType", message::text 
    FROM evolution."Message" 
    WHERE "messageType" = 'imageMessage' 
    LIMIT 3
  `);
  for (const r of imgs.rows) {
    console.log(`\n  Type: ${r.messageType}`);
    console.log(`  Message: ${r.message.substring(0, 600)}`);
  }

  // Sample messages with URLs in text
  console.log('\n=== MESSAGES WITH URLs (sample) ===');
  const urls = await c.query(`
    SELECT id, "messageType", message::text 
    FROM evolution."Message" 
    WHERE message::text LIKE '%http%' 
    LIMIT 3
  `);
  for (const r of urls.rows) {
    console.log(`\n  Type: ${r.messageType}`);
    console.log(`  Message: ${r.message.substring(0, 600)}`);
  }

  // Sample conversation/text messages
  console.log('\n=== TEXT MESSAGES (sample) ===');
  const txt = await c.query(`
    SELECT id, "messageType", message::text 
    FROM evolution."Message" 
    WHERE "messageType" IN ('conversation', 'extendedTextMessage')
    LIMIT 2
  `);
  for (const r of txt.rows) {
    console.log(`\n  Type: ${r.messageType}`);
    console.log(`  Message: ${r.message.substring(0, 500)}`);
  }

  await c.end();
}

run().catch(e => console.error('Error:', e.message));
