import pkg from 'pg';
const { Client } = pkg;

const DATABASE_URL = "postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

async function checkQuery() {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('Testing V40.2 Query (Length > 100)...');
    const res = await client.query(`
        WITH filtered_messages AS (
          SELECT 
            id, 
            key as whatsapp_id, 
            "messageType", 
            message, 
            CASE 
              WHEN "messageType" = 'conversation' THEN message->>'conversation' 
              WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text' 
              WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'caption' 
              ELSE '' 
            END as text_content 
          FROM evolution."Message" 
          WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage')
        )
        SELECT COUNT(*) FROM filtered_messages 
        WHERE length(text_content) > 100
    `);
    console.log('Number of messages qualifying for V40.2 processing:', res.rows[0].count);
    
    if (res.rows[0].count > 0) {
        const sample = await client.query(`
            WITH filtered_messages AS (
              SELECT 
                id, 
                key as whatsapp_id, 
                "messageType", 
                message, 
                CASE 
                  WHEN "messageType" = 'conversation' THEN message->>'conversation' 
                  WHEN "messageType" = 'extendedTextMessage' THEN message->'extendedTextMessage'->>'text' 
                  WHEN "messageType" = 'imageMessage' THEN message->'imageMessage'->>'caption' 
                  ELSE '' 
                END as text_content 
              FROM evolution."Message" 
              WHERE "messageType" IN ('conversation', 'extendedTextMessage', 'imageMessage')
            )
            SELECT text_content FROM filtered_messages 
            WHERE length(text_content) > 100
            LIMIT 1
        `);
        console.log('Sample content found:', sample.rows[0].text_content.slice(0, 100) + '...');
    }
  } catch (err) {
    console.error('Query test failed:', err);
  } finally {
    await client.end();
  }
}

checkQuery();
