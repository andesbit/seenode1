import express from 'express';
import {searchOffers} from '../database/search.js';
import { getDatabase } from '../database/index.js';
import {publicKey} from '../utils/keys.js';
const router = express.Router();

function buttonsPagination(paginaActual, totalPaginas) 
{
    let botonesHTML = '<div class="paginacion">';
    
    if (paginaActual > 1) { // Botón Primero
        botonesHTML += `<a href="/?pagina=1" class="btn-pagina">« Primero</a>`;
    } else {
        botonesHTML += `<span class="btn-pagina deshabilitado">« Primero</span>`;
    }
    
    if (paginaActual > 1) { // Botón Anterior
        botonesHTML += `<a href="/?pagina=${paginaActual - 1}" class="btn-pagina">‹ Anterior</a>`;
    } else {
        botonesHTML += `<span class="btn-pagina deshabilitado">‹ Anterior</span>`;
    }
    
    // Botones numerados (mostramos máximo 5 números)
    let inicioNumero = Math.max(1, paginaActual - 2);
    let finNumero = Math.min(totalPaginas, inicioNumero + 4);
    
    // Ajustar inicio si estamos cerca del final
    if (finNumero - inicioNumero < 4) {
        inicioNumero = Math.max(1, finNumero - 4);
    }
    for (let i = inicioNumero; i <= finNumero; i++) {
        if (i === paginaActual) {
            botonesHTML += `<span class="btn-pagina activo">${i}</span>`;
        } else {
            botonesHTML += `<a href="/?pagina=${i}" class="btn-pagina">${i}</a>`;
        }
    }
    
    // Botón Siguiente
    if (paginaActual < totalPaginas) {
        botonesHTML += `<a href="/?pagina=${paginaActual + 1}" class="btn-pagina">Siguiente ›</a>`;
    } else {
        botonesHTML += `<span class="btn-pagina deshabilitado">Siguiente ›</span>`;
    }
    
    // Botón Último
    if (paginaActual < totalPaginas) {
        botonesHTML += `<a href="/?pagina=${totalPaginas}" class="btn-pagina">Último »</a>`;
    } else {
        botonesHTML += `<span class="btn-pagina deshabilitado">Último »</span>`;
    }
    
    botonesHTML += '</div>';
    return botonesHTML;
}

/*
function pagination(nUsers, curPage)
{
    //const numElemsPerPage = 5;//AHORA DEBE SER FIJO
    const nElementsPag = 5;
    //const totalPages = getNumPagesDB(numElemsPerPage);
    
    let nPages = 0 //6
    //let nUsers = arrayOffers.length //getNumUsersDB()
    nPages = Math.trunc(nUsers/nElementsPag);
    let residuo = nUsers/nElementsPag
    if(residuo > 0)nPages++
    //const totalPages = nPages;

    if(nPages > 0)    
        if (curPage < 1 || curPage > nPages) 
            return "<<"
            
    //
    let ejsP = buttonsPagination(curPage, nPages)
    return ejsP
}
*/

async function getOffersPaginatedWithTotal(page = 1, pageSize = 10) {

  const db = await getDatabase();  

  // 1. Contar el total de registros
  const countResult = await db.get('SELECT COUNT(*) as total FROM offers');
  const total = countResult.total;
  const totalPages = Math.ceil(total / pageSize);
  
  // 2. Obtener los registros de la página
  const offset = (page - 1) * pageSize;
  const arrayOffers = await db.all(
    'SELECT * FROM offers ORDER BY id DESC LIMIT ? OFFSET ?',
    [pageSize, offset]
  );
  
  
  //console.log(`📄 Página ${page} de ${totalPages} (${total} registros totales)`);
  
  return {
    data: arrayOffers,
    pagination: {
      currentPage: page,
      pageSize: pageSize,
      totalRecords: total,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
}

// Uso:
//const result = await getOffersPaginatedWithTotal(1, 20);
//console.log('Datos:', result.data);
//console.log('Info paginación:', result.pagination);
// {
//   data: [...],
//   pagination: {
//     currentPage: 1,
//     pageSize: 20,
//     totalRecords: 150,
//     totalPages: 8,
//     hasNextPage: true,
//     hasPrevPage: false
//   }
// }

router.get('/', async(req, res) => 
{
    /*const db = await getDatabase()
    const curPage = parseInt(req.query.pagina) || 1;
    const arrayOffers = await db.all('SELECT * FROM offers')
    let ejsPagination = pagination(arrayOffers.length, curPage)
    if(ejsPagination === "<<") return res.redirect('/?pagina=1');
    */

    const curPage = parseInt(req.query.pagina) || 1;
    const result = await getOffersPaginatedWithTotal(curPage, 2);
    let arrayOffers= result.data
    //const curPage = result.pagination.currentPage
    const nPages = result.pagination.totalPages
    let ejsPagination = buttonsPagination(curPage, nPages)

    res.render('index', {
        title: 'Página Principal',
        offers: arrayOffers,
        kpaginacion: ejsPagination
    });
});

//===============================================

router.post('/search-offer', async (req, res) => {
    
    const criterio = req.body;
    let crts = {}

    for (let clave in criterio) {
        if (criterio[clave]) { // Solo copia si el valor es "verdadero" (no vacío, no null, no undefined)
            crts[clave] = criterio[clave];
        }
    }

    const a = await searchOffers(crts)

    res.json({ 
        success: true,
        action: 'searchoffer',
        result: a
    });

});

//========================================================

router.get('/about', (req, res) => {
    
    res.render('about', {
        title: 'Acerca de....'        
    });
});

//==================================================================

router.get('/get-public-key', (req, res) => {
  res.json({ publicKey: publicKey });
}); 

export default router
