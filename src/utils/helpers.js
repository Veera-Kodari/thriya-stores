/**
 * Helper / utility functions
 */

function greet(name) {
  return `Hello, ${name}! Welcome to your Node.js learning project 🚀`;
}

function getTimestamp() {
  return new Date().toISOString();
}

module.exports = { greet, getTimestamp };
