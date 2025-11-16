// ============================================
// database/seed.js
// ============================================
import { getDatabase } from './index.js';

async function seedDatabase() {

   const db = await getDatabase();

  console.log('🌱 Sembrando datos iniciales...');
  
  const usuariosExistentes = await db.get('SELECT COUNT(*) as count FROM offers');
  
  //if (usuariosExistentes.count === 0) {
  if (usuariosExistentes.count < 7) {
    await db.transaction(async (db) => {
      const usuarios = [
        { nombre: 'Ana', email: 'anaf@example.com', pais: 'Perú', ciudad: 'Lima', offer: 'none', espe: 'espe', extra: 'extra' },
        { nombre: 'arlos López', email: 'carlos@example.com', pais: 'Perú', ciudad: 'Lima', offer: 'none', espe: 'espi', extra: 'extra' },
        { nombre: 'María', email: 'mariaf@example.com', pais: 'Perú', ciudad: 'Cusco', offer: 'none', espe: 'espe', extra: 'extra'  }
      ];
      
      for (const u of usuarios) {
        await db.run(
          'INSERT INTO offers (name, email, country, city, offer, espe, extra ) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [u.nombre, u.email, u.pais, u.ciudad, u.offer, u.espe, u.extra]
        );
      }
    });
    
    console.log('✅ Datos iniciales insertados');
  } else {
    console.log('ℹ️  Base de datos ya contiene datos');
  }
}
export {seedDatabase}