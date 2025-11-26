// src/database/PostgresDatabase.js
import pkg from 'pg';
const { Pool } = pkg;

class PostgresDatabase {
    constructor(connectionString) {
        this.pool = new Pool({
            connectionString: connectionString,
            ssl: process.env.NODE_ENV === 'production' 
                ? { rejectUnauthorized: false } 
                : false
        });
    }

    async connect() {
        try {
            const client = await this.pool.connect();
            console.log('✅ PostgreSQL conectado');
            client.release();
        } catch (err) {
            console.error('❌ Error conectando a PostgreSQL:', err);
            throw err;
        }
    }

    // Convertir placeholders de SQLite (?) a PostgreSQL ($1, $2, ...)
    convertPlaceholders(sql) {
        let index = 0;
        return sql.replace(/\?/g, () => `$${++index}`);
    }

    async get(sql, params = []) {
        sql = this.convertPlaceholders(sql);
        const result = await this.pool.query(sql, params);
        return result.rows[0] || null;
    }

    async all(sql, params = []) {
        sql = this.convertPlaceholders(sql);
        const result = await this.pool.query(sql, params);
        return result.rows;
    }

    async run(sql, params = []) {
        sql = this.convertPlaceholders(sql);
        
        // Si es INSERT y no tiene RETURNING, añadirlo
        if (sql.trim().toUpperCase().startsWith('INSERT') && 
            !sql.toUpperCase().includes('RETURNING')) {
            sql += ' RETURNING *';
        }
        
        const result = await this.pool.query(sql, params);
        
        return {
            lastID: result.rows[0]?.id || null,
            changes: result.rowCount
        };
    }

    async exec(sql) {
        // Si tiene dollar-quoted strings, ejecutar todo junto
        if (sql.includes('$$')) {
            await this.pool.query(sql);
        } else {
            // Dividir por ; solo si no hay dollar quotes
            const statements = sql.split(';').filter(s => s.trim());
            for (const statement of statements) {
                if (statement.trim()) {
                    await this.pool.query(statement);
                }
            }
        }
    }
    
    async close() {
        await this.pool.end();
        console.log('✅ PostgreSQL cerrado');
    }

    async transaction(callback) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            // Crear un proxy temporal para usar el client en transacción
            const transactionDb = {
                run: async (sql, params = []) => {
                    sql = this.convertPlaceholders(sql);
                    if (sql.trim().toUpperCase().startsWith('INSERT') && 
                        !sql.toUpperCase().includes('RETURNING')) {
                        sql += ' RETURNING *';
                    }
                    const result = await client.query(sql, params);
                    return {
                        lastID: result.rows[0]?.id || null,
                        changes: result.rowCount
                    };
                },
                get: async (sql, params = []) => {
                    sql = this.convertPlaceholders(sql);
                    const result = await client.query(sql, params);
                    return result.rows[0] || null;
                },
                all: async (sql, params = []) => {
                    sql = this.convertPlaceholders(sql);
                    const result = await client.query(sql, params);
                    return result.rows;
                }
            };
            
            const result = await callback(transactionDb);
            await client.query('COMMIT');
            return result;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

export default PostgresDatabase;