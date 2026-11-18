const fs = require('node:fs/promises');
const path = require('node:path');

const dataDirectory = path.join(__dirname, 'data');
const files = {
  users: path.join(dataDirectory, 'users.json'),
  expenses: path.join(dataDirectory, 'expenses.json')
};
const writeQueues = { users: Promise.resolve(), expenses: Promise.resolve() };

async function read(collection) {
  try {
    return JSON.parse(await fs.readFile(files[collection], 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    await write(collection, []);
    return [];
  }
}

function write(collection, records) {
  const operation = writeQueues[collection].then(async () => {
    await fs.mkdir(dataDirectory, { recursive: true });
    const temporaryFile = `${files[collection]}.tmp`;
    await fs.writeFile(temporaryFile, JSON.stringify(records, null, 2));
    await fs.rename(temporaryFile, files[collection]);
  });
  writeQueues[collection] = operation.catch(() => {});
  return operation;
}

module.exports = { read, write, files };
