"use strict";

const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const { copyFile, readFile, unlink } = require("node:fs/promises");
const net = require("node:net");
const path = require("node:path");

const seedDatabase = path.join(__dirname, "db.json");
const testDatabase = path.join(__dirname, ".smoke-db.json");
let apiProcess = null;
let apiOutput = "";

function getAvailablePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function request(baseUrl, route, options = {}) {
  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    headers: {
      "Accept": "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  return { response, data };
}

async function waitForApi(baseUrl) {
  let lastError = null;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (apiProcess.exitCode !== null) {
      throw new Error(`json-server stopped during startup.\n${apiOutput}`);
    }

    try {
      const { response } = await request(baseUrl, "/expenses");
      if (response.ok) return;
    } catch (error) {
      // The server may need a moment before it accepts connections.
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`json-server did not start in time.\n${lastError || ""}\n${apiOutput}`);
}

async function stopApi() {
  if (!apiProcess || apiProcess.exitCode !== null) return;

  await new Promise((resolve) => {
    apiProcess.once("exit", resolve);
    apiProcess.kill();
    const forceStopTimer = setTimeout(() => {
      if (apiProcess.exitCode === null) apiProcess.kill("SIGKILL");
    }, 2000);
    forceStopTimer.unref();
  });
}

async function runSmokeTest() {
  const seed = JSON.parse(await readFile(seedDatabase, "utf8"));
  assert.equal(seed.expenses.length, 6, "The seed database should contain exactly six expenses");
  await copyFile(seedDatabase, testDatabase);

  const port = await getAvailablePort();
  const baseUrl = `http://localhost:${port}`;
  const cliPath = require.resolve("json-server/lib/cli/bin.js");

  apiProcess = spawn(process.execPath, [cliPath, "--watch", testDatabase, "--port", String(port)], {
    cwd: __dirname,
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true
  });
  apiProcess.stdout.on("data", (chunk) => { apiOutput += chunk.toString(); });
  apiProcess.stderr.on("data", (chunk) => { apiOutput += chunk.toString(); });

  await waitForApi(baseUrl);

  const getAll = await request(baseUrl, "/expenses");
  assert.equal(getAll.response.status, 200);
  assert.equal(getAll.data.length, 6);
  console.log("PASS  GET /expenses returned the six seeded records");

  const newExpense = {
    title: "CRUD smoke test",
    description: "Temporary record created by the automated test",
    amount: 12.5,
    category: "Other",
    date: "2026-05-18",
    status: "Pending"
  };
  const post = await request(baseUrl, "/expenses", {
    method: "POST",
    body: JSON.stringify(newExpense)
  });
  assert.equal(post.response.status, 201);
  assert.ok(post.data.id, "POST should return a generated id");
  assert.equal(post.data.title, newExpense.title);
  const newId = post.data.id;
  console.log(`PASS  POST /expenses created record ${newId}`);

  const patch = await request(baseUrl, `/expenses/${newId}`, {
    method: "PATCH",
    body: JSON.stringify({ amount: 19.75, status: "Paid" })
  });
  assert.equal(patch.response.status, 200);
  assert.equal(patch.data.amount, 19.75);
  assert.equal(patch.data.status, "Paid");
  assert.equal(patch.data.title, newExpense.title, "PATCH should preserve unchanged fields");
  console.log(`PASS  PATCH /expenses/${newId} updated only amount and status`);

  const getOne = await request(baseUrl, `/expenses/${newId}`);
  assert.equal(getOne.response.status, 200);
  assert.equal(getOne.data.amount, 19.75);
  assert.equal(getOne.data.status, "Paid");
  console.log(`PASS  GET /expenses/${newId} confirmed the persisted update`);

  const remove = await request(baseUrl, `/expenses/${newId}`, { method: "DELETE" });
  assert.equal(remove.response.status, 200);
  console.log(`PASS  DELETE /expenses/${newId} removed the test record`);

  const finalList = await request(baseUrl, "/expenses");
  assert.equal(finalList.response.status, 200);
  assert.equal(finalList.data.length, 6);
  assert.equal(finalList.data.some((expense) => String(expense.id) === String(newId)), false);
  console.log("PASS  Final GET confirmed the seed records are intact");
}

(async () => {
  try {
    await runSmokeTest();
    console.log("\nAll ExpenseTracker Fetch CRUD checks passed.");
  } catch (error) {
    console.error("\nSMOKE TEST FAILED:", error);
    process.exitCode = 1;
  } finally {
    await stopApi();
    await unlink(testDatabase).catch(() => {});
  }
})();
