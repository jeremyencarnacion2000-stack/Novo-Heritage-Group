const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiMzQ2NzAyMDMtMTY3Yi00MzU4LWFmMGItODJkOTI3ZDQ5MmFkIiwiaWF0IjoxNzc0MjE2NDQ3fQ.XOLYUNjKiQFcdvQ9tKhmNT7yrk7D4B9kExRZBII8lyU";
const url = "https://n8n-l2mj.onrender.com/api/v1/workflows?limit=1";

async function testKey() {
    try {
        const response = await fetch(url, {
            headers: { 'X-N8N-API-KEY': API_KEY }
        });
        const data = await response.json();
        console.log("Status:", response.status);
        if (response.status === 200) {
            console.log("SUCCESS: Key is valid.");
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testKey();
