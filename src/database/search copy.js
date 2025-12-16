import { getDatabase } from './index.js';

async function searchOffers(filters = {}) {
    const db = await getDatabase();
    const conditions = [];
    const params = [];
    
    // Detectar si es PostgreSQL
    const isPostgres = process.env.DATABASE_URL !== undefined;
    
    // ⭐ Operador de búsqueda: ILIKE (PostgreSQL) o LIKE (SQLite)
    const LIKE = isPostgres ? 'ILIKE' : 'LIKE';

    // ⭐ Búsquedas parciales case-insensitive (nombre, ciudad, especialidades)
    if (filters.name && filters.name.trim() !== '') {
        conditions.push(`name ${LIKE} ?`);
        params.push(`%${filters.name.trim()}%`);
    }

    // ⭐ Búsqueda EXACTA de email (case-sensitive)
    if (filters.email && filters.email.trim() !== '') {
        conditions.push('email = ?');
        params.push(filters.email.trim());
    }

    // Búsqueda exacta de país
    if (filters.country && filters.country.trim() !== '') {
        conditions.push('country = ?');
        params.push(filters.country.trim());
    }

    // Búsqueda exacta de ciudad
    if (filters.city && filters.city.trim() !== '') {
        conditions.push('city = ?');
        params.push(filters.city.trim());
    }

    // Búsqueda parcial case-insensitive en especialidades
    if (filters.espe && filters.espe.trim() !== '') {
        conditions.push(`espe ${LIKE} ?`);
        params.push(`%${filters.espe.trim()}%`);
    }

    try {
        let sql = 'SELECT * FROM offers';
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' OR ');
        }
        
        sql += ' ORDER BY id DESC';
        
        console.log('📝 SQL:', sql);
        console.log('📊 Params:', params);
        
        const results = await db.all(sql, params);
        
        console.log(`✅ Encontrados ${results.length} registros`);
        return results;
        
    } catch (error) {
        console.error('❌ Error en búsqueda:', error);
        throw error;
    }
}

//============================================
// ⭐ Búsqueda EXACTA de email
async function getOfferIdByEmail(email) {
    const db = await getDatabase();
    
    try {
        const result = await db.get(
            'SELECT id FROM offers WHERE email = ?',
            [email]
        );
        
        if (result) {
            console.log(`✅ ID encontrado: ${result.id} para email: ${email}`);
            return result.id;
        } else {
            console.log(`❌ No se encontró oferta con email: ${email}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error al buscar oferta por email:', error);
        throw error;
    }
}

//==================================================================
// ⭐ Búsqueda EXACTA por ID
async function getOfferById(id) {
    const db = await getDatabase();
    
    try {
        const result = await db.get(
            'SELECT * FROM offers WHERE id = ?',
            [id]
        );
        
        if (result) {
            console.log(`✅ Oferta encontrada: ID ${result.id}`);
            return result;
        } else {
            console.log(`❌ No se encontró oferta con ID: ${id}`);
            return null;
        }
    } catch (error) {
        console.error('❌ Error al buscar oferta por ID:', error);
        throw error;
    }
}

//=============================================================
export { searchOffers, getOfferIdByEmail, getOfferById };
//======================= END ==================================