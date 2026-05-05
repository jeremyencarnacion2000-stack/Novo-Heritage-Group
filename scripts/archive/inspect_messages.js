const { Client } = require('pg');

async function run() {
  const c = new Client({
    connectionString: 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full'
  });
  await c.connect();

  // 1. Check message structure
  console.log('=== MESSAGE COLUMNS ===');
  const cols = await c.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_schema='evolution' AND table_name='Message' ORDER BY ordinal_position`);
  for (const r of cols.rows) {
    console.log(`  ${r.column_name} (${r.data_type})`);
  }

  // 2. Find messages with images/media
  console.log('\n=== MESSAGES WITH MEDIA (sample) ===');
  const media = await c.query(`
    SELECT id, key, "messageType", message, "mediaUrl", "messageTimestamp"
    FROM evolution."Message" 
    WHERE "messageType" IS NOT NULL AND "messageType" != 'conversation' AND "messageType" != 'extendedTextMessage'
    LIMIT 10
  `);
  
  if (media.rows.length === 0) {
    // Try different approach - search in message JSON
    console.log('No messageType filter results. Checking message content...');
    const alt = await c.query(`
      SELECT id, key, message, "messageTimestamp"
      FROM evolution."Message" 
      WHERE message::text LIKE '%image%' OR message::text LIKE '%media%' OR message::text LIKE '%url%'
      LIMIT 10
    `);
    for (const r of alt.rows) {
      console.log(`\n  ID: ${r.id}`);
      console.log(`  Message: ${JSON.stringify(r.message).substring(0, 500)}`);
    }
  } else {
    for (const r of media.rows) {
      console.log(`\n  ID: ${r.id}`);
      console.log(`  Type: ${r.messageType}`);
      console.log(`  MediaUrl: ${r.mediaUrl}`);
      console.log(`  Message: ${JSON.stringify(r.message).substring(0, 400)}`);
    }
  }

  // 3. Count by message type
  console.log('\n=== MESSAGE TYPE DISTRIBUTION ===');
  const types = await c.query(`
    SELECT "messageType", COUNT(*) as cnt 
    FROM evolution."Message" 
    GROUP BY "messageType" 
    ORDER BY cnt DESC 
    LIMIT 15
  `);
  for (const r of types.rows) {
    console.log(`  ${r.messageType || 'NULL'}: ${r.cnt}`);
  }

  // 4. Check for mediaUrl column
  console.log('\n=== MESSAGES WITH mediaUrl ===');
  const withMedia = await c.query(`
    SELECT COUNT(*) as total FROM evolution."Message" WHERE "mediaUrl" IS NOT NULL AND "mediaUrl" != ''
  `);
  console.log(`  With mediaUrl: ${withMedia.rows[0].total}`);

  // 5. Sample a text message to see format
  console.log('\n=== SAMPLE TEXT MESSAGE ===');
  const textMsg = await c.query(`SELECT id, key, message, "messageType" FROM evolution."Message" WHERE message IS NOT NULL LIMIT 3`);
  for (const r of textMsg.rows) {
    console.log(`\n  Type: ${r.messageType}`);
    console.log(`  Message: ${JSON.stringify(r.message).substring(0, 500)}`);
  }

  await c.end();
}

run().catch(e => console.error('Error:', e.message));
