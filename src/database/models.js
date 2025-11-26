import { getDatabase } from './index.js';

async function createOffersTable() {
    const db = await getDatabase();
    
    // Detectar si es PostgreSQL o SQLite
    const isPostgres = process.env.DATABASE_URL !== undefined;
    
    const CREATE_TABLE_SQL = isPostgres ? `
        CREATE TABLE IF NOT EXISTS offers (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255),
            country VARCHAR(100),
            city VARCHAR(100),
            offer TEXT,
            espe TEXT,
            extra TEXT,
            cnts TEXT,
            role VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ` : `
        CREATE TABLE IF NOT EXISTS offers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            country TEXT,
            city TEXT,
            offer TEXT,
            espe TEXT,
            extra TEXT,
            cnts TEXT,
            role TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
    `;

    // PostgreSQL y SQLite manejan triggers de forma diferente
    let CREATE_TRIGGER_SQL;
    
    if (isPostgres) {
        // PostgreSQL: ejecutar en pasos separados
        CREATE_TRIGGER_SQL = [
            `CREATE OR REPLACE FUNCTION update_offers_timestamp()
             RETURNS TRIGGER AS $
             BEGIN
                 NEW.updated_at = CURRENT_TIMESTAMP;
                 RETURN NEW;
             END;
             $ LANGUAGE plpgsql`,
            
            `DROP TRIGGER IF EXISTS update_offers_timestamp ON offers`,
            
            `CREATE TRIGGER update_offers_timestamp
             BEFORE UPDATE ON offers
             FOR EACH ROW
             EXECUTE FUNCTION update_offers_timestamp()`
        ];
    } else {
        // SQLite
        CREATE_TRIGGER_SQL = [`
            CREATE TRIGGER IF NOT EXISTS update_offers_timestamp 
            AFTER UPDATE ON offers
            FOR EACH ROW
            BEGIN
                UPDATE offers SET updated_at = CURRENT_TIMESTAMP
                WHERE id = NEW.id;
            END
        `];
    }

    const CREATE_INDEXES_SQL = [
        'CREATE INDEX IF NOT EXISTS idx_offers_email ON offers(email);',
        'CREATE INDEX IF NOT EXISTS idx_offers_name ON offers(name);',
        'CREATE INDEX IF NOT EXISTS idx_offers_country ON offers(country);',
        'CREATE INDEX IF NOT EXISTS idx_offers_city ON offers(city);',
        'CREATE INDEX IF NOT EXISTS idx_offers_country_city ON offers(country, city);'
    ];

    try {
        console.log('⏳ Ejecutando comando SQL para crear la tabla...');
        await db.exec(CREATE_TABLE_SQL);
        console.log('✅ Tabla "offers" creada o ya existía.');

        console.log('⏳ Creando trigger para updated_at...');
        for (const triggerSQL of CREATE_TRIGGER_SQL) {
            await db.exec(triggerSQL);
        }
        console.log('✅ Trigger creado exitosamente.');

        console.log('⏳ Creando índices...');
        for (const indexSQL of CREATE_INDEXES_SQL) {
            await db.exec(indexSQL);
        }
        console.log('✅ Índices creados exitosamente.');

    } catch (error) {
        console.error('❌ Error al intentar crear la tabla, trigger o índices:', error);
        throw error;
    }
}

const modelsPrepare = async () => {
    console.log("🛠️ Iniciando preparación de modelos...");
    await createOffersTable(); 
    console.log("✅ Preparación de modelos finalizada.");
}

export { modelsPrepare }