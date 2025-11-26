// database/index.js
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import Database from './Database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let instance = null;

async function getDatabase() {
    if (!instance) {
        // Usar /tmp en producción, data/ en desarrollo
        const isProduction = process.env.NODE_ENV === 'production';
        const dataDir = isProduction ? '/tmp' : join(__dirname, '../../data');
        
        if (!isProduction && !existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
        }
        
        const dbPath = join(dataDir, 'app.db');
        instance = new Database(dbPath);
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

export { getDatabase, closeDatabase };