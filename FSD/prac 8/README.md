# Practical 8: Callbacks and the Node.js event loop

The first script demonstrates synchronous and asynchronous callbacks, including error-first callbacks. The second shows how synchronous code, promises, timers, and file I/O are scheduled by Node.js.

## Run the scripts

1. Install Node.js and open a terminal in this practical folder.
2. Enter the project directory and run:

   ```powershell
   Set-Location -LiteralPath 'NodeJS_Practical'
   node callbacks.js
   node eventLoop.js
   ```

3. Compare the terminal output. Notice when the synchronous messages run and compare the timer and immediate scheduled inside the file callback. Top-level timer ordering can vary. No npm install or web server is needed.
