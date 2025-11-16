import express from 'express'
import { getDatabase } from '../database/index.js';
//import { getOfferIdByEmail } from '../database/search.js';
//import { insertOffer } from '../database/crud/insert.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';


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

router.get('/', async (req, res) =>
{
    const db = await getDatabase()
    //const { nombre, email, edad, ciudad } = req.body
    let nombre = "b"
    let email = "bc@"    
    let ciudad = "c"

    //?await runMigrations(db);
    /*
    // SQL directo sin modelos
    const result = await db.run(
    'INSERT INTO offers (name, email, city) VALUES (?, ?, ?)',
    [nombre, email, ciudad]
    );
    */
    ///////

    const curPage = parseInt(req.query.pagina) || 1;
    const numElemsPerPage = 5;//AHORA DEBE SER FIJO
    const totalPages = 1;//getNumPagesDB(numElemsPerPage);

    if(totalPages > 0)    
        if (curPage < 1 || curPage > totalPages) return res.redirect('/?pagina=1');
    
    //let arrayOffers = pagesDB("OFFERS", curPage, numElemsPerPage) //collectionDB ()

    let ejsP = buttonsPagination(curPage,totalPages)

    //////////7
    const arrayOffers = await db.all('SELECT * FROM offers')
    
    //res.json({ success: true, data: arrayOffers });
    
     res.render('admin/index', {
        title: 'ADMIN',        
        offers: arrayOffers,
        kpaginacion: ejsP
    });
});


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//SELECTEDSTYLE!
router.get('/chat-man', async (req, res) => {
    const chatPath = path.join(__dirname, '..', '..', 'DB/MESSAGES');
    
    
    try {
        const allFiles = await fs.readdir(chatPath);
        const jsonFiles = allFiles.filter(f => f.endsWith('.json'));
        
        //res.render('admin/chat_manager', { offers: jsonFiles });
        res.render('admin/manchat', { offers: jsonFiles });
    } catch (error) {
        console.error('Error:', error);
        res.render('chat', { offers: [] });
    }
});

///////////////////PRUEBA
//SELECTEDSTYLE!
router.get('/pru', async (req, res) =>
{
    // Backend - Supongamos que envías esto:

    const offers = [
        {
            id: 1,
            nombreArchivo: "documento.json",
            fechaCreacion: "2024-11-14",
            tamaño: "15KB",
            autor: "Usuario1",
            descripcion: "Este es un archivo de prueba con una descripción más larga"
        },
        {
            id: 2,
            nombreArchivo: "datos.json",
            fechaCreacion: "2024-11-13",
            tamaño: "8KB",
            autor: "Usuario2",
            descripcion: "Otro archivo"
        }
    ];
    res.render('admin/pru', { offers });
})


////////ENDPRUEBA


//import fs from 'fs/promises';
//import path from 'path';
//import { fileURLToPath } from 'url';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

// Ruta DELETE para eliminar archivos
router.delete('/chuat/:filename', async (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '..', '..', 'DB/MESSAGES', filename);
    
    try {
        // Validar que sea un archivo .json
        if (!filename.endsWith('.json')) {
            return res.status(400).json({ 
                success: false, 
                error: 'Solo se pueden eliminar archivos .json' 
            });
        }
        
        await fs.unlink(filePath);
        res.json({ success: true, message: `${filename} eliminado` });
    } catch (error) {
        console.error('Error al eliminar:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});


//EEEEEEEEXAMPLE
/*
router.get('/admin', authMiddleware, async (req, res) => {
    try {
        // Verificar si es administrador
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: 'Acceso denegado. Se requiere rol de administrador.' 
            });
        }
        
        res.json({
            message: 'Panel de administración',
            adminData: {
                usuariosConectados: 15,
                estadisticas: {  }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en panel admin' });
    }
});
*/

export default router
