/**
 * Example: File System operations
 * Run: node src/examples/file-system.js
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'temp', 'sample.txt');
const dirPath = path.dirname(filePath);

// Ensure temp directory exists
if (!fs.existsSync(dirPath)) {
  fs.mkdirSync(dirPath, { recursive: true });
}

// Write a file
fs.writeFileSync(filePath, 'Hello from fs module!\n');
console.log('File written successfully.');

// Read the file
const content = fs.readFileSync(filePath, 'utf-8');
console.log('File content:', content);

// Append to the file
fs.appendFileSync(filePath, 'This line was appended.\n');
console.log('Content appended.');

// Read again
console.log('Updated content:', fs.readFileSync(filePath, 'utf-8'));
