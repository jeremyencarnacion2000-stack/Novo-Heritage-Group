import fetch from 'node-fetch';

const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiM2QzM2QxMTEtZjk4Zi00NGE0LWE1NTYtOTQ0NmYwY2MzOGQwIiwiaWF0IjoxNzc0MTYxMTEzfQ.7yaXK2HyRO4wQFQ7ew1XpUsFRo6XhFnrAzfczTe-EEo";
const url = "https://n8n-l2mj.onrender.com/api/v1/workflows?limit=1";

async function testKey() {
    try {
        const response = await fetch(url, {
            headers: { 'X-N8N-API-KEY': API_KEY }
        });
        const data = await response.json();
        console.log("Response:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error:", e.message);
    }
}

testKey();
