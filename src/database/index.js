// database/index.js
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import Database from './Database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let instance = null;

async function getDatabase() {
  if (!instance) {
    const path = join(__dirname, '../data/app.db')
    instance = new Database(path);
    await instance.connect();
  }
  return instance;
}

async function closeDatabase() {
    if (instance) {
        await instance.close();
        instance = null;
    }
}

export { getDatabase , closeDatabase};
