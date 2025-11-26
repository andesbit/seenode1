import { getDatabase } from './index.js';

async function createOffersTable() {
  const db = await getDatabase();
  
  const CREATE_TABLE_SQL = `
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
  
  // Trigger para actualizar updated_at automáticamente
  const CREATE_TRIGGER_SQL = `
    CREATE TRIGGER IF NOT EXISTS update_offers_timestamp 
    AFTER UPDATE ON offers
    FOR EACH ROW
    BEGIN
      UPDATE offers SET updated_at = CURRENT_TIMESTAMP
      WHERE id = NEW.id;
    END;
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
    await db.run(CREATE_TABLE_SQL);
    console.log('✅ Tabla "offers" creada o ya existía.');
    
    console.log('⏳ Creando trigger para updated_at...');
    await db.run(CREATE_TRIGGER_SQL);
    console.log('✅ Trigger creado exitosamente.');
    
    console.log('⏳ Creando índices...');
    for (const indexSQL of CREATE_INDEXES_SQL) {
      await db.run(indexSQL);
    }
    console.log('✅ Índices creados exitosamente.');
  } catch (error) {
    console.error('❌ Error al intentar crear la tabla, trigger o índices:', error);
  }
}

const modelsPrepare = async () => {
  console.log("🛠️ Iniciando preparación de modelos...");
  await createOffersTable(); 
  console.log("✅ Preparación de modelos finalizada.");
}

export { modelsPrepare }