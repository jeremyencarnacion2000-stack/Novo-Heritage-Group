const { execSync } = require('child_process');

const envs = {
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '587',
  SMTP_USER: 'novoheritagesales@gmail.com',
  SMTP_PASSWORD: 'ufyeojhbpioatphc',
  RECIPIENT_EMAIL: 'novoheritagesales@gmail.com',
  SMTP_SECURE: 'false',
  N8N_WEBHOOK_URL: 'https://suskj501-n8n.hf.space/webhook/leads',
  N8N_API_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmNjdmNjA0Mi0xMWI3LTQxNDctYTM3My01ODVkZWNjYTkxNTMiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiOTY1ZWIxY2MtYmIyMi00MzZhLWIxYTUtNTA2ZjgzNmU5MzU3IiwiaWF0IjoxNzc4Mjc2MzU3fQ.03tz7CfKCJyUP_pdDLwk1r7aK4XLc5W6dQPgFtcsl1w'
};

for (const [key, val] of Object.entries(envs)) {
  console.log('Adding', key);
  try {
    execSync(`npx vercel env rm ${key} production --yes`, { stdio: 'ignore' });
  } catch(e) {}
  execSync(`npx vercel env add ${key} production --yes`, { input: val, stdio: 'pipe' });
}
console.log('Finished setting env vars');
