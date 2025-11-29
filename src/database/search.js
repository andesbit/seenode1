import { getDatabase } from './index.js';

async function searchOffers(filters = {}) {
    const db = await getDatabase();
    const conditions = [];
    const params = [];

    // Filtros normales (con índices, búsqueda rápida)
    if (filters.name && filters.name.trim() !== '') {
        conditions.push('name LIKE ?');
        params.push(filters.name.trim());
    }

    if (filters.email && filters.email.trim() !== '') {
        conditions.push('email = ?');    
        params.push(filters.email.trim());
    }

    if (filters.country && filters.country.trim() !== '') {
        conditions.push('country = ?');
        params.push(filters.country.trim());
    }

    if (filters.city && filters.city.trim() !== '') {
        conditions.push('city = ?');
        params.push(filters.city.trim());
    }

    if (filters.espe && filters.espe.trim() !== '') {
        conditions.push('espe LIKE ?');
        let espec = '%'+filters.espe.trim()+'%';
        params.push(espec);
    }

    try {
        let sql = 'SELECT * FROM offers';
        
        if (conditions.length > 0) {
            sql += ' WHERE ' + conditions.join(' OR '); // Búsqueda con OR
        }
        
        sql += ' ORDER BY id DESC';  // Mostrar las más recientes primero
        
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
async function getOfferById(id) {
    const db = await getDatabase();
    
    try {
        const result = await db.get(
            'SELECT * FROM offers WHERE id = ?',
            [id]
        );
        
        if (result) {
            const sobj = JSON.stringify(result);
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