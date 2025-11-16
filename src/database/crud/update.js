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