import { getDatabase } from '../index.js';

// Insertar oferta con especialidades
async function insertOffer(offerData){//, specialtiesArray) {
  const db = await getDatabase();
  
  // Convertir array a cadena separada por comas
  //const espeString = specialtiesArray.join(',');
  
  const result = await db.run(
    `INSERT INTO offers (name, email, country, city, offer, espe, extra) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      offerData.name,
      offerData.email,
      offerData.country,
      offerData.city,
      offerData.offer,
      offerData.espe,
      //espeString,  // ← "Cardiología,Medicina General"
      offerData.extra
    ]
  );
  
  console.log(`✅ Oferta ${result.lastID} creada`);
  return result.lastID;
}
export { insertOffer };
