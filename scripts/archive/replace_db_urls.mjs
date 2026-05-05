import fs from 'fs';
import path from 'path';

const OLD_URL_PART = 'ep-rapid-hill-adiehuvc-pooler.c-2.us-east-1.aws.neon.tech';
const NEW_URL = 'postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full';

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        walk(fullPath);
      }
    } else {
      const ext = path.extname(file);
      if (['.js', '.mjs', '.ts', '.tsx', '.py', '.local', '.example', '.json'].includes(ext) || file === '.env.local') {
        let content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes(OLD_URL_PART)) {
          console.log(`Updating ${fullPath}...`);
          // Regex to replace the full connection string if it looks like postgresql://...
          // But a simple string replace of the URL might be enough if we just want to update the host part
          // Actually, let's replace the whole string if possible, or just the part.
          // The old URL structure is: postgresql://angel:NegdPai-zZFnyyNsT2jdmg@long-dwarf-15398.jxf.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full
          const regex = /postgresql:\/\/neondb_owner:[^@]+@ep-rapid-hill-adiehuvc-pooler\.c-2\.us-east-1\.aws\.neon\.tech\/neondb(\?sslmode=require)?(&channel_binding=require)?/g;
          content = content.replace(regex, NEW_URL);
          // Also catch any other partials
          content = content.replace(/postgresql:\/\/neondb_owner:[^@]+@ep-rapid-hill-adiehuvc-pooler\.c-2\.us-east-1\.aws\.neon\.tech\/neondb/g, NEW_URL);
          fs.writeFileSync(fullPath, content);
        }
      }
    }
  }
}

walk('.');
console.log('All files updated.');
