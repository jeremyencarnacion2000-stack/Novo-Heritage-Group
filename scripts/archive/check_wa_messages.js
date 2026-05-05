import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function check() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('--- RECENT MESSAGES FROM WHATSAPP ---');
    const res = await client.query(`
      SELECT 
        "messageType", 
        "messageTimestamp",
        CASE
          WHEN "messageType" = 'conversation' THEN message->>'conversation'
          WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text'
          WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'caption'
          ELSE 'MEDIA (No Caption)'
        END as text_content
      FROM evolution."Message"
      ORDER BY "messageTimestamp" DESC
      LIMIT 10
    `);
    
    res.rows.forEach(r => {
      console.log(`- [${new Date(r.messageTimestamp * 1000).toISOString()}] [${r.messageType}]: ${String(r.text_content).slice(0, 100)}...`);
    });
  } catch (err) {
    console.error('Error querying messages:', err);
  } finally {
    await client.end();
  }
}

check();
