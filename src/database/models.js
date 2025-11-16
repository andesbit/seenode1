
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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const CREATE_INDEXES_SQL = [
    'CREATE INDEX IF NOT EXISTS idx_offers_email ON offers(email);',
    'CREATE INDEX IF NOT EXISTS idx_offers_name ON offers(name);',
    'CREATE INDEX IF NOT EXISTS idx_offers_country ON offers(country);',
    'CREATE INDEX IF NOT EXISTS idx_offers_city ON offers(city);',
    'CREATE INDEX IF NOT EXISTS idx_offers_country_city ON offers(country, city);'
    // NO crear índice en 'espe' porque es texto con valores múltiples
  ];

  try {
    console.log('⏳ Ejecutando comando SQL para crear la tabla...');
    await db.run(CREATE_TABLE_SQL);
    console.log('✅ Tabla "offers" creada o ya existía.');

    console.log('⏳ Creando índices...');
    for (const indexSQL of CREATE_INDEXES_SQL) {
      await db.run(indexSQL);
    }
    console.log('✅ Índices creados exitosamente.');

  } catch (error) {
    console.error('❌ Error al intentar crear la tabla o índices:', error);
  }
}

const modelsPrepare = async () => {
    console.log("🛠️ Iniciando preparación de modelos...");
    // AWAIT AQUI: Espera a que la tabla se cree antes de continuar.
    await createOffersTable(); 
    console.log("✅ Preparación de modelos finalizada.");
}


export { modelsPrepare }