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
        // Subir DOS niveles: de src/database/ a /usr/src/
        const dataDir = join(__dirname, '../../data');
        
        // Crear la carpeta si no existe
        if (!existsSync(dataDir)) {
            mkdirSync(dataDir, { recursive: true });
            console.log('📁 Carpeta data creada en:', dataDir);
        }
        
        const dbPath = join(dataDir, 'app.db');
        console.log('📍 Ruta de BD configurada:', dbPath);
        
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