console.log("1. Script start (synchronous)");

setTimeout(() => {
  console.log("2. setTimeout callback (macrotask - timers phase)");
}, 0);

setImmediate(() => {
  console.log("3. setImmediate callback (macrotask - check phase)");
});

process.nextTick(() => {
  console.log("4. process.nextTick callback (microtask - highest priority)");
});

Promise.resolve().then(() => {
  console.log("5. Promise.then callback (microtask)");
});

console.log("6. Script end (synchronous)");

const fs = require("fs");

fs.readFile(__filename, () => {
  setTimeout(() => {
    console.log("7. setTimeout inside I/O callback (timers phase)");
  }, 0);

  setImmediate(() => {
    console.log("8. setImmediate inside I/O callback (check phase)");
  });
});

console.log("9. readFile requested (asynchronous I/O starts)");
