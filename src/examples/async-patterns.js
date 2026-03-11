/**
 * Example: Async patterns – callbacks, promises, async/await
 * Run: node src/examples/async-patterns.js
 */

// 1. Callback style
function fetchDataCallback(cb) {
  setTimeout(() => {
    cb(null, 'Data from callback');
  }, 500);
}

fetchDataCallback((err, data) => {
  if (err) return console.error(err);
  console.log('Callback:', data);
});

// 2. Promise style
function fetchDataPromise() {
  return new Promise((resolve) => {
    setTimeout(() => resolve('Data from promise'), 500);
  });
}

fetchDataPromise().then((data) => console.log('Promise:', data));

// 3. Async / Await
async function main() {
  const data = await fetchDataPromise();
  console.log('Async/Await:', data);
}

main();
