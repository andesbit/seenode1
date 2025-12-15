import { getDatabase } from './index.js';

async function addColumnIfNotExists(db, tableName, columnName, columnType) {
  const isPostgres = process.env.DATABASE_URL !== undefined;
  
  try {
    let columnExists = false;
    
    if (isPostgres) {
      // PostgreSQL
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [tableName, columnName]);
      columnExists = result.rows.length > 0;
    } else {
      // SQLite
      const tableInfo = await db.all(`PRAGMA table_info(${tableName})`);
      columnExists = tableInfo.some(col => col.name === columnName);
    }
    
    if (!columnExists) {
      if (isPostgres) {
        await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      } else {
        await db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`);
      }
      console.log(`✅ Columna "${columnName}" agregada a "${tableName}"`);
    } else {
      console.log(`ℹ️ Columna "${columnName}" ya existe en "${tableName}"`);
    }
  } catch (error) {
    console.error(`❌ Error agregando columna "${columnName}":`, error);
  }
}

async function createOffersTable() {
    const db = await getDatabase();
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

    const CREATE_INDEXES_SQL = [
        'CREATE INDEX IF NOT EXISTS idx_offers_email ON offers(email);',
        'CREATE INDEX IF NOT EXISTS idx_offers_name ON offers(name);',
        'CREATE INDEX IF NOT EXISTS idx_offers_country ON offers(country);',
        'CREATE INDEX IF NOT EXISTS idx_offers_city ON offers(city);',
        'CREATE INDEX IF NOT EXISTS idx_offers_country_city ON offers(country, city);'
    ];

    try {
        console.log('⏳ Ejecutando comando SQL para crear la tabla...');
        
        if (isPostgres) {
            await db.query(CREATE_TABLE_SQL);
        } else {
            await db.exec(CREATE_TABLE_SQL);
        }
        
        console.log('✅ Tabla "offers" creada o ya existía.');

        // Solo crear trigger en SQLite
        if (!isPostgres) {
            console.log('⏳ Creando trigger para updated_at (SQLite)...');
            const SQLITE_TRIGGER = `
                CREATE TRIGGER IF NOT EXISTS update_offers_timestamp 
                AFTER UPDATE ON offers
                FOR EACH ROW
                BEGIN
                    UPDATE offers SET updated_at = CURRENT_TIMESTAMP
                    WHERE id = NEW.id;
                END;
            `;
            await db.exec(SQLITE_TRIGGER);
            console.log('✅ Trigger creado exitosamente.');
        } else {
            console.log('ℹ️  PostgreSQL: updated_at se manejará en el código de la aplicación.');
        }

        console.log('⏳ Creando índices...');
        for (const indexSQL of CREATE_INDEXES_SQL) {
            if (isPostgres) {
                await db.query(indexSQL);
            } else {
                await db.exec(indexSQL);
            }
        }
        console.log('✅ Índices creados exitosamente.');

        // Agregar nuevas columnas si no existen
        await addColumnIfNotExists(db, 'offers', 'logo', 'TEXT');

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