import { getDatabase } from '../index.js';

async function insertOffer(offerData) {
    const db = await getDatabase();
    
    // ✅ Ahora son 9 columnas (agregamos cnts)
    const result = await db.run(
        `INSERT INTO offers (name, email, country, city, offer, espe, extra, cnts, role) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            offerData.name || '',
            offerData.email || '',
            offerData.country || '',
            offerData.city || '',
            offerData.offer || '',
            offerData.espe || '',
            offerData.extra || '',
            offerData.cnts || '[]',  // ✅ Ahora coincide con la columna cnts
            offerData.role || 'user'
        ]
    );
    
    console.log(`✅ Oferta ${result.lastID} creada`);
    return result.lastID;
}

export { insertOffer };