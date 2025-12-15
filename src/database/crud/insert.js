// database/crud/insert.js (o create.js)
import { getDatabase } from '../index.js';

async function insertOffer(offerData) {
    const db = await getDatabase();
    
    try {
        // INSERT con 9 columnas
        const result = await db.run(
            `INSERT INTO offers (name, email, country, city, offer, espe, extra, cnts, role. logo) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                offerData.name || '',
                offerData.email || '',
                offerData.country || '',
                offerData.city || '',
                offerData.offer || '',
                offerData.espe || '',
                offerData.extra || '',
                offerData.cnts || '[]',
                offerData.role || 'user',
                offerData.logo || ''
            ]
        );
        
        console.log(`✅ Oferta ${result.lastID} creada exitosamente`);
        return result.lastID;
        
    } catch (error) {
        console.error('❌ Error al insertar oferta:', error);
        throw error;
    }
}

export { insertOffer };
