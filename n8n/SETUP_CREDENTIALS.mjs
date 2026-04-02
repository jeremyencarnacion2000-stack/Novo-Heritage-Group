import fs from 'fs';
import path from 'path';

const N8N_API_URL = "https://n8n-l2mj.onrender.com/api/v1";
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiM2QzM2QxMTEtZjk4Zi00NGE0LWE1NTYtOTQ0NmYwY2MzOGQwIiwiaWF0IjoxNzc0MTYxMTEzfQ.7yaXK2HyRO4wQFQ7ew1XpUsFRo6XhFnrAzfczTe-EEo";

async function setupCredentials() {
    console.log("🔑 Configurando credenciales...");

    const credentials = [
        {
            name: "Postgres account",
            type: "postgres",
            data: {
                host: "ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech",
                database: "neondb",
                user: "neondb_owner",
                password: "npg_Yhvk2DzABn6P",
                port: 5432,
                ssl: "require",
                sshAuthenticateWith: "none"
            }
        },
        {
            name: "Groq account",
            type: "groqApi",
            data: {
                apiKey: process.env.GROQ_API_KEY || "your_api_key_here"
            }
        }
    ];

    for (const cred of credentials) {
        try {
            const response = await fetch(`${N8N_API_URL}/credentials`, {
                method: 'POST',
                headers: {
                    'X-N8N-API-KEY': API_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cred)
            });

            const result = await response.json();
            if (response.ok) {
                console.log(`✅ Credencial '${cred.name}' creada con éxito.`);
            } else {
                console.error(`❌ Error en '${cred.name}': ${JSON.stringify(result)}`);
            }
        } catch (error) {
            console.error(`💥 Error enviando credencial '${cred.name}': ${error.message}`);
        }
    }
}

setupCredentials();
