import pkg from 'pg';
const { Client } = pkg;

const url = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

async function run() {
    const client = new Client({ connectionString: url });
    await client.connect();
    try {
        const res = await client.query('SELECT COUNT(*) as count FROM evolution."Message"');
        console.log('Evolution Messages Count:', res.rows[0].count);

        // Check some recent messages to see if they are property-related
        const res2 = await client.query('SELECT "messageType", message FROM evolution."Message" ORDER BY id DESC LIMIT 5');
        console.log('Recent Messages:', JSON.stringify(res2.rows, null, 2));

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await client.end();
    }
}
run();
