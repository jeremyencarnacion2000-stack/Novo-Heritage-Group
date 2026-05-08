import postgres from 'postgres';

const url = "postgresql://angel:3dZYY-CDYXI07q_XqV6MIw@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";

const sql = postgres(url);

async function test() {
    try {
        const res = await sql`SELECT 1`;
        console.log("Connection successful:", res);
    } catch (e) {
        console.error("Connection failed:", e);
    }
    process.exit(0);
}

test();
