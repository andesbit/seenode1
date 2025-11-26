// database/update.js
import { getDatabase } from '../index.js';

async function updateOffer(offerId, offerData){//, specialtiesArray) {
  // Validaciones básicas
  if (!offerId || offerId <= 0) {
    throw new Error('ID de oferta inválido');
  }
  
  if (!offerData || typeof offerData !== 'object') {
    throw new Error('Datos de oferta inválidos');
  }
  
  const db = await getDatabase();
  
  // Convertir array a cadena (maneja el caso de array vacío)
  //const espeString = Array.isArray(specialtiesArray) ? specialtiesArray.join(',') : '';
  /*
  try {
    const result = await db.run(
      `UPDATE offers 
       SET name = ?, email = ?, country = ?, city = ?, offer = ?, espe = ?, extra = ?
       WHERE id = ?`,
      [
        offerData.name || '',
        offerData.email || '',
        offerData.country || '',
        offerData.city || '',
        offerData.offer || '',
        //espeString,
        offerData.espe || '',
        offerData.extra || '',
        offerId
      ]
    );
  */

      // ⭐ AQUÍ: Extraer los campos del objeto offerData
  const fields = Object.keys(offerData);
  
  // Validar que haya al menos un campo para actualizar
  if (fields.length === 0) {
    throw new Error('No hay campos para actualizar');
  }
 const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = Object.values(offerData);

  const sql = `UPDATE offers SET ${setClause} WHERE id = ?`;

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

export {updateOffer}