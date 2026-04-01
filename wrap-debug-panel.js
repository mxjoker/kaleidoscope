#!/usr/bin/env node
/**
 * HELPER SCRIPT: Find and replace Raw Events section in index.html
 * 
 * This script will:
 * 1. Find the Raw Events section in the DM Report
 * 2. Wrap it with the debug panel container
 * 3. Save the updated file
 * 
 * Usage: node wrap-debug-panel.js
 */

const fs = require('fs');
const path = require('path');

const indexPath = './index.html';

try {
  let content = fs.readFileSync(indexPath, 'utf8');
  
  // Pattern to find: <div class="card"> followed by dm-section-title "Raw Events"
  // We're looking for the exact section in the DM Report panel
  
  const pattern = /(<div class="card">\s*<div class="dm-section-title">Raw Events<\/div>\s*<div id="dm-raw-events">[\s\S]*?<\/div>\s*<\/div>)/;
  
  if (!pattern.test(content)) {
    console.error('❌ Could not find Raw Events section in index.html');
    console.error('Looking for pattern: <div class="card">...<div class="dm-section-title">Raw Events</div>...');
    process.exit(1);
  }
  
  // Wrap it with debug panel
  const wrapped = content.replace(
    pattern,
    `<div class="debug-panel hidden">
  <div class="debug-panel-header">
    <span class="debug-panel-title">🔧 Raw Events (Debug)</span>
    <span class="debug-panel-toggle">▶</span>
  </div>
  <div class="debug-panel-content">
    $1
  </div>
</div>`
  );
  
  // Write back
  fs.writeFileSync(indexPath, wrapped, 'utf8');
  console.log('✅ Successfully wrapped Raw Events in debug panel!');
  console.log('✅ Debug panel will start HIDDEN (closed) by default');
  console.log('✅ Users can click the header to toggle visibility');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
