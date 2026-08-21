// combined.js – single entry point for Replit
require('dotenv').config();

// Start collector (adjust path if needed)
const collector = require('./collector/src');
if (collector && typeof collector.start === 'function') {
  collector.start();
} else {
  console.warn('Collector start function not found');
}

// Start API server (adjust path if needed)
const server = require('./server/src');
if (server && typeof server.start === 'function') {
  server.start();
} else {
  console.warn('Server start function not found');
}

// Serve frontend static build
const express = require('express');
const path = require('path');
const app = express();
const buildPath = path.join(__dirname, 'frontend', 'build');
app.use(express.static(buildPath));
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Combined ContextIQ running on port ${PORT}`));
