# Practical 8: Asynchronous Execution using Callbacks and the Event Loop

## Aim
To understand asynchronous execution using Callbacks and the Event Loop in Node.js.

## Files
| File | Demonstrates |
|------|--------------|
| `callbacks.js` | Synchronous callbacks, asynchronous callbacks, error-first callbacks, and nested callbacks (callback hell) |
| `eventLoop.js` | Execution order of synchronous code, microtasks (`process.nextTick`, `Promise.then`), and macrotasks (`setTimeout`, `setImmediate`, I/O) |

## How to run
```bash
node callbacks.js
node eventLoop.js
```

## Theory

### Callbacks
A callback is a function passed as an argument to another function and invoked after a task completes.
- **Synchronous callback** runs immediately, before the calling function returns.
- **Asynchronous callback** runs later (e.g. after `setTimeout` or file I/O), letting the program continue in the meantime.
- **Error-first callback** follows the Node.js convention `callback(error, result)`: the first argument is `null` on success or an `Error` on failure.
- **Nested callbacks** ("callback hell") occur when one async task depends on the result of the previous one, producing deeply indented code.

### Event Loop
The event loop lets single-threaded Node.js handle non-blocking operations by repeatedly processing queues:
1. **Call stack** – synchronous code runs first, top to bottom.
2. **Microtasks** – `process.nextTick` queue, then the Promise queue. Drained fully after each phase.
3. **Timers phase** – executes `setTimeout` / `setInterval` callbacks whose time has elapsed.
4. **I/O phase** – handles file system, network, and other I/O callbacks.
5. **Check phase** – executes `setImmediate` callbacks.
6. **Close phase** – handles close events.

## Expected output (eventLoop.js)

```
1. Script start (synchronous)
6. Script end (synchronous)
9. readFile requested (asynchronous I/O starts)
4. process.nextTick callback (microtask - highest priority)
5. Promise.then callback (microtask)
2. setTimeout callback (macrotask - timers phase)
3. setImmediate callback (macrotask - check phase)
8. setImmediate inside I/O callback (check phase)
7. setTimeout inside I/O callback (timers phase)
```

Note: In the main module, the order between `setTimeout(..., 0)` and `setImmediate()` can vary between runs. Inside an I/O callback (lines 7 and 8) the order is deterministic: `setImmediate` always runs before `setTimeout`.

## Conclusion
Node.js performs synchronous code first, drains microtasks, then processes macrotasks through the event loop. Callbacks are the mechanism by which asynchronous results are delivered back to the program.
