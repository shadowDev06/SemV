import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(toolsDirectory, '..');
const output = path.join(root, 'screenshots');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  deviceScaleFactor: 1,
  colorScheme: 'light'
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));

async function open(url) {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      await page.evaluate(() => document.fonts.ready);
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(500);
    }
  }
  throw lastError;
}

async function capture(name, fullPage = true) {
  await page.screenshot({ path: path.join(output, name), fullPage, animations: 'disabled' });
  console.log(`Captured ${name}`);
}

async function captureTerminal(program, title) {
  const log = await fs.readFile(path.join(root, 'source', program, program === 'program-5' ? 'server/output.txt' : 'output.txt'), 'utf8');
  const escaped = value => value.replace(/[&<>]/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[character]);
  const lines = log.trim().split('\n').map(line => {
    let className = 'normal';
    if (/PASS|RESULT|STOPPED|CLOSED|UNCHANGED/.test(line)) className = 'success';
    else if (/\b4\d\d\b/.test(line)) className = 'warning';
    else if (/^EVENT/.test(line)) className = 'event';
    else if (/^SERVER|^EXPENSE|^LEDGERLY/.test(line)) className = 'heading';
    return `<span class="${className}">${escaped(line)}</span>`;
  }).join('\n');
  const terminal = await context.newPage();
  await terminal.setViewportSize({ width: 1400, height: Math.max(680, 185 + log.trim().split('\n').length * 28) });
  await terminal.setContent(`<!doctype html><html><head><style>
    *{box-sizing:border-box}body{margin:0;background:#e8ecef;font-family:Consolas,'Courier New',monospace;color:#d7dce2}
    .window{margin:28px;background:#0d1117;border:1px solid #3b424b;border-radius:10px;overflow:hidden;box-shadow:0 16px 45px #17202b38}
    .titlebar{height:52px;background:#1c232c;display:flex;align-items:center;padding:0 18px;border-bottom:1px solid #343c46;font:13px 'Segoe UI',sans-serif;color:#d4dbe2}
    .dots{display:flex;gap:7px;margin-right:22px}.dots i{width:11px;height:11px;border-radius:50%;background:#ff5f57}.dots i:nth-child(2){background:#febc2e}.dots i:nth-child(3){background:#28c840}
    .tab{margin-left:auto;margin-right:auto;color:#aeb8c2}.content{padding:24px 30px 30px;font-size:17px;line-height:1.62}
    .prompt{color:#7ee787;margin:0 0 15px;white-space:pre-wrap}.path{color:#79b8ff}.command{color:#f0f3f6}
    pre{margin:0;white-space:pre-wrap;font:inherit}.normal{color:#d6dde4}.heading{color:#79b8ff;font-weight:bold}.success{color:#7ee787;font-weight:bold}.warning{color:#f2cc60}.event{color:#d2a8ff}
    .footer{font:11px 'Segoe UI',sans-serif;color:#87929e;padding:11px 30px;background:#151b22;border-top:1px solid #29313a;display:flex;justify-content:space-between}
  </style></head><body><div class="window"><div class="titlebar"><span class="dots"><i></i><i></i><i></i></span><span>Windows PowerShell</span><span class="tab">${title}</span><span>— □ ×</span></div><div class="content"><p class="prompt"><span class="path">PS C:\\Mohd Ali\\Ves\\semV\\FSD\\CA 3\\source\\${program}${program === 'program-5' ? '\\server' : ''}</span>&gt; <span class="command">npm run demo</span></p><pre>${lines}</pre></div><div class="footer"><span>Actual automated test output</span><span>UTF-8 · Node.js v24.22.2</span></div></div></body></html>`, { waitUntil: 'load' });
  await terminal.screenshot({ path: path.join(output, `${program}-terminal-output.png`), fullPage: true });
  await terminal.close();
  console.log(`Captured ${program}-terminal-output.png`);
}

try {
  await open('http://127.0.0.1:5500');
  await page.evaluate(async () => {
    const records = await fetch('http://localhost:3000/expenses').then(response => response.json());
    await Promise.all(records.filter(item => item.title === 'Full Stack workshop').map(item =>
      fetch(`http://localhost:3000/expenses/${item.id}`, { method: 'DELETE' })
    ));
  });
  await open('http://127.0.0.1:5500');
  await page.waitForFunction(() => document.querySelectorAll('#expenseTableBody tr').length === 6);
  await page.waitForSelector('#apiPill[data-state="online"]');
  await capture('program-1-dashboard.png');
  await page.click('#openAddBtn');
  await page.fill('#title', 'Full Stack workshop');
  await page.fill('#description', 'Practical workshop registration');
  await page.fill('#amount', '29.50');
  await page.selectOption('#category', 'Education');
  await page.selectOption('#status', 'Pending');
  await capture('program-1-expense-form.png', false);
  await page.click('#saveExpenseBtn');
  await page.waitForFunction(() => !document.querySelector('#expenseDialog').open);
  await page.waitForFunction(() => document.querySelector('#activityList')?.textContent.includes('POST'));
  await capture('program-1-post-output.png');
  const added = await page.evaluate(async () => {
    const records = await fetch('http://localhost:3000/expenses').then(response => response.json());
    const record = records.find(item => item.title === 'Full Stack workshop');
    if (record) await fetch(`http://localhost:3000/expenses/${record.id}`, { method: 'DELETE' });
    return Boolean(record);
  });
  if (!added) throw new Error('Program 1 POST verification failed');

  await open('http://127.0.0.1:5174');
  await page.waitForSelector('text=Expense history');
  await capture('program-2-dashboard.png');
  await open('http://127.0.0.1:5174/add');
  await page.fill('#title', 'Design patterns textbook');
  await page.fill('#amount', '42.99');
  const category = await page.locator('#category option').nth(1).getAttribute('value');
  await page.selectOption('#category', category);
  await page.fill('#notes', 'Reference book for the full-stack development practical.');
  await capture('program-2-add-expense.png');

  await captureTerminal('program-3', 'Native Node.js HTTP Server');
  await captureTerminal('program-4', 'Express REST API + JWT');

  await open('http://localhost:5173');
  await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 6);
  await page.waitForSelector('text=Weekly groceries');
  await capture('program-5-dashboard.png');
  await page.getByRole('button', { name: 'Add expense' }).click();
  await page.fill('input[name="title"]', 'Full-stack integration test');
  await page.fill('input[name="amount"]', '19.99');
  await page.selectOption('select[name="category"]', 'Education');
  await page.fill('textarea[name="note"]', 'React form saved through Express into MongoDB');
  await page.getByRole('button', { name: 'Add expense', exact: true }).last().click();
  await page.waitForSelector('text=Expense added to MongoDB');
  await page.waitForSelector('text=Full-stack integration test');
  await capture('program-5-create-output.png');
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Delete Full-stack integration test' }).click();
  await page.waitForFunction(() => !document.body.textContent.includes('Full-stack integration test'));
  await captureTerminal('program-5', 'MERN Integration + Mongoose');

  if (errors.length) throw new Error(`Browser errors: ${errors.join('; ')}`);
  console.log('All screenshots captured and temporary browser records removed.');
} finally {
  await browser.close();
}
