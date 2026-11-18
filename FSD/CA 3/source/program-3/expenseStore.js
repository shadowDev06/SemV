'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { EventEmitter } = require('node:events');

const DEFAULT_DATA_FILE = path.join(__dirname, 'data', 'expenses.json');

class ExpenseStore extends EventEmitter {
  constructor({ dataFile = DEFAULT_DATA_FILE } = {}) {
    super();
    this.dataFile = path.resolve(dataFile);
    this.expenses = null;
    this.writeQueue = Promise.resolve();
  }

  async init() {
    await fs.mkdir(path.dirname(this.dataFile), { recursive: true });

    try {
      const contents = await fs.readFile(this.dataFile, 'utf8');
      const parsed = JSON.parse(contents);
      if (!Array.isArray(parsed)) {
        throw new Error('Expense data must contain a JSON array.');
      }
      this.expenses = parsed;
    } catch (error) {
      if (error.code === 'ENOENT') {
        this.expenses = [];
        await this.writeSnapshot(this.expenses);
      } else if (error instanceof SyntaxError) {
        throw new Error(`Cannot parse expense data at ${this.dataFile}: ${error.message}`);
      } else {
        throw error;
      }
    }

    return this;
  }

  async writeSnapshot(expenses) {
    // A temporary file in the same directory makes rename atomic on one volume.
    const temporaryFile = path.join(
      path.dirname(this.dataFile),
      `.${path.basename(this.dataFile)}.${process.pid}.${randomUUID()}.tmp`
    );

    try {
      await fs.writeFile(temporaryFile, `${JSON.stringify(expenses, null, 2)}\n`, {
        encoding: 'utf8',
        flag: 'wx'
      });
      await fs.rename(temporaryFile, this.dataFile);
    } finally {
      await fs.rm(temporaryFile, { force: true }).catch(() => {});
    }
  }

  assertReady() {
    if (!this.expenses) {
      throw new Error('ExpenseStore.init() must complete before using the store.');
    }
  }

  enqueue(operation) {
    // Serialize mutations to prevent concurrent requests from losing updates.
    const result = this.writeQueue.then(operation, operation);
    this.writeQueue = result.catch(() => {});
    return result;
  }

  async list() {
    this.assertReady();
    await this.writeQueue;
    return this.expenses.map((expense) => ({ ...expense }));
  }

  async get(id) {
    this.assertReady();
    await this.writeQueue;
    const expense = this.expenses.find((item) => item.id === id);
    return expense ? { ...expense } : null;
  }

  async create(input) {
    this.assertReady();
    return this.enqueue(async () => {
      const timestamp = new Date().toISOString();
      const expense = {
        id: randomUUID(),
        title: input.title,
        amount: input.amount,
        category: input.category,
        date: input.date,
        status: input.status,
        createdAt: timestamp,
        updatedAt: timestamp
      };
      const next = [...this.expenses, expense];

      await this.writeSnapshot(next);
      this.expenses = next;
      this.emit('create', { ...expense });
      return { ...expense };
    });
  }

  async update(id, changes) {
    this.assertReady();
    return this.enqueue(async () => {
      const index = this.expenses.findIndex((item) => item.id === id);
      if (index === -1) {
        return null;
      }

      const updated = {
        ...this.expenses[index],
        ...changes,
        id: this.expenses[index].id,
        createdAt: this.expenses[index].createdAt,
        updatedAt: new Date().toISOString()
      };
      const next = [...this.expenses];
      next[index] = updated;

      await this.writeSnapshot(next);
      this.expenses = next;
      this.emit('update', { ...updated });
      return { ...updated };
    });
  }

  async delete(id) {
    this.assertReady();
    return this.enqueue(async () => {
      const expense = this.expenses.find((item) => item.id === id);
      if (!expense) {
        return null;
      }

      const next = this.expenses.filter((item) => item.id !== id);
      await this.writeSnapshot(next);
      this.expenses = next;
      this.emit('delete', { ...expense });
      return { ...expense };
    });
  }
}

module.exports = { DEFAULT_DATA_FILE, ExpenseStore };
