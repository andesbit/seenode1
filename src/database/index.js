// database/index.js
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import { existsSync, mkdirSync } from 'fs'
import Database from './Database.js'
import PostgresDatabase from './PostgresDatabase.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

let instance = null;

async function getDatabase() {
    if (!instance) {
        // Si existe DATABASE_URL en el .env, usar PostgreSQL
        if (process.env.DATABASE_URL) {
            console.log('🐘 Conectando a PostgreSQL (producción)');
            instance = new PostgresDatabase(process.env.DATABASE_URL);
        } else {
            // Si no, usar SQLite local (desarrollo)
            console.log('💾 Usando SQLite local (desarrollo)');
            const dataDir = join(__dirname, '../../data');
            
            if (!existsSync(dataDir)) {
                mkdirSync(dataDir, { recursive: true });
                console.log('📁 Carpeta data creada');
            }
            
            const dbPath = join(dataDir, 'app.db');
            instance = new Database(dbPath);
        }
        
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