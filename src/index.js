/**
 * Node.js Learning Project - Entry Point
 *
 * Topics to explore:
 * 1. Modules (require / module.exports)
 * 2. File System (fs)
 * 3. HTTP server
 * 4. Events & Streams
 * 5. Async patterns (callbacks, promises, async/await)
 */

const { greet } = require('./utils/helpers');

// --- Quick start ---
const name = 'Kalyan';
console.log(greet(name));
console.log(`Node.js version: ${process.version}`);
console.log(`Platform: ${process.platform}`);
console.log(`Current directory: ${__dirname}`);
