import express from 'express';
import {searchInDB, getNumPagesDB, pagesDB} from '../utils/database.js';
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

router.get('/', (req, res) => 
{
    const curPage = parseInt(req.query.pagina) || 1;
    const numElemsPerPage = 5;//AHORA DEBE SER FIJO
    const totalPages = getNumPagesDB(numElemsPerPage);
      
    if (curPage < 1 || curPage > totalPages) return res.redirect('/?pagina=1');
   
    let arrayOffers = pagesDB("OFFERS", curPage, numElemsPerPage) //collectionDB ()

    let ejsP = buttonsPagination(curPage,totalPages)

    res.render('index', {
        title: 'Página Principal',
        offers: arrayOffers,
        kpaginacion: ejsP
    });
});

//===============================================

router.post('/search-offer', async (req, res) => {
    
    const { name,espe } = req.body;
    
    try {
        //updateDB("DATA",user_id,{name,offer,espe})
        let a= searchInDB ("OFFERS", "name", name);
        res.json({ 
            success: true,
            action: 'searchoffer',            
            data: "prueba de datos",
            result:a
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor',
                    success: false,
                    action: 'searchoffer',            
                    data: "No se pudo realizar la prueba"
        });
    }
});

router.get('/about', (req, res) => {
    
    res.render('about', {
        title: 'Acerca de....'        
    });
});

export default router
