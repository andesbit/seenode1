/*import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
    host: 'localhost',
    database: 'datapi',
    user: 'adolfo',
    password: 'asimillatorix23',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Verificar conexión al inicio
pool.on('connect', () => {
    console.log('✅ Conectado a PostgreSQL');
});

pool.on('error', (err) => {
    console.error('❌ Error en el pool de PostgreSQL:', err);
});

export default pool;
*/