// database/delete.js
import { getDatabase } from '../index.js';

async function deleteOffer(id, permanente = false) {
  const db = await getDatabase();
  
  if (permanente) {
    const result = await db.run('DELETE FROM usuarios WHERE id = ?', [id]);
    return result.changes > 0;
  } else {
    ;
    // Soft delete
    //return await this.actualizarUsuario(id, { activo: 0 });
  }        
}
export {deleteOffer}