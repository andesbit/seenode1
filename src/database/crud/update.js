// database/crud/update.js
import { getDatabase } from '../index.js';

async function updateOffer(offerId, offerData) {
    // Validaciones básicas
    if (!offerId || offerId <= 0) {
        throw new Error('ID de oferta inválido');
    }
    
    if (!offerData || typeof offerData !== 'object') {
        throw new Error('Datos de oferta inválidos');
    }
    
    const db = await getDatabase();
    
    // Extraer los campos del objeto offerData
    const fields = Object.keys(offerData);
    
    // Validar que haya al menos un campo para actualizar
    if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
    }
    
    // Construir el SET clause dinámicamente
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const values = Object.values(offerData);
    
    // ⭐ IMPORTANTE: Agregar updated_at automáticamente
    const sql = `UPDATE offers 
                 SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
                 WHERE id = ?`;
    
    try {
        const result = await db.run(sql, [...values, offerId]);
        
        if (result.changes > 0) {
            console.log(`✅ Oferta ${offerId} actualizada exitosamente`);
            return {
                success: true,
                changes: result.changes,
                message: `Oferta ${offerId} actualizada`
            };
        } else {
            console.log(`⚠️ No se encontró la oferta con ID: ${offerId}`);
            return {
                success: false,
                changes: 0,
                message: 'Oferta no encontrada'
            };
        }
    } catch (error) {
        console.error(`❌ Error al actualizar oferta ${offerId}:`, error);
        throw error;
    }
}

// Función auxiliar para actualizar campos específicos (opcional)
async function updateOfferFields(offerId, fields) {
    // Validar campos permitidos
    const allowedFields = ['name', 'email', 'country', 'city', 'offer', 'espe', 'extra', 'cnts', 'role'];
    const invalidFields = Object.keys(fields).filter(f => !allowedFields.includes(f));
    
    if (invalidFields.length > 0) {
        throw new Error(`Campos no permitidos: ${invalidFields.join(', ')}`);
    }
    
    return await updateOffer(offerId, fields);
}

export { updateOffer, updateOfferFields };