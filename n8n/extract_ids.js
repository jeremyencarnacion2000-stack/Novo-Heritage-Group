const fs = require('fs');
let content = fs.readFileSync('n8n/list_response_utf8.json', 'utf8');
if (content.charCodeAt(0) === 0xFEFF) {
    content = content.slice(1);
}
const data = JSON.parse(content);
data.data.forEach(wf => {
    if (wf.name.includes('[Godmode]')) {
        console.log(`ID: ${wf.id} | NAME: ${wf.name}`);
    }
});
