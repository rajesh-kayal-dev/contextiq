const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const config = require('../replit.mcp.json');
const endpoint = `${config.endpoint}/api/v1/mcp/projects/contextiq/deploy`;

(async () => {
  const zipPath = path.resolve(__dirname, '..', 'project.zip');
  if (!fs.existsSync(zipPath)) {
    console.error('❌ project.zip not found. Please create a zip of the repository root first.');
    process.exit(1);
  }
  const zip = fs.readFileSync(zipPath);
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': config.authHeader,
        'Content-Type': 'application/zip'
      },
      body: zip
    });
    const data = await res.json();
    console.log('Deploy response:', data);
  } catch (err) {
    console.error('❌ Deploy failed:', err);
  }
})();
