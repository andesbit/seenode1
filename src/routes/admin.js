import express from 'express'
import { getDatabase } from '../database/index.js';
import {authMiddleware} from '../utils/jwtUtils.js'
//import { getOfferIdByEmail } from '../database/search.js';
//import { insertOffer } from '../database/crud/insert.js';
import { deleteOffer } from '../database/crud/delete.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

router.get('/', /*NOPUEDOUSARAHORAauthMiddleware,PORQUE METE EL USER DEL TOKEN*/ async (req, res) =>
{    
    if(!req.user){
        res.render('user/unauthorized', {});
        return    
    }
    try {
        // Verificar si es administrador
        ///*
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                error: `Acceso denegado. Se requiere rol de administrador. Su rol actual es ${req.user.role}` 

            });
        }
         //*/             
        console.log(req.user.role)
        const db = await getDatabase()
        const arrayOffers = await db.all('SELECT * FROM offers')
        //res.json({ success: true, data: arrayOffers });        
        res.render('admin/index', { rol: req.user.role, offers: arrayOffers });
    } catch (error) {
        res.status(500).json({ error: 'Error en panel admin' });
    }
});

// Ruta para eliminar un registro
router.delete('/usuarios/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { permanente } = req.query; // Para usar: DELETE /usuarios/123?permanente=true
    
    // Validar que el ID sea válido
    if (!id || isNaN(id)) {
      return res.status(400).json({ 
        error: 'ID inválido' 
      });
    }
    
    // Ejecutar el borrado
    const resultado = await deleteOffer(parseInt(id), permanente === 'true');
    
    if (resultado) {
      return res.status(200).json({ 
        mensaje: permanente === 'true' 
          ? 'Usuario eliminado permanentemente' 
          : 'Usuario desactivado',
        id: id
      });
    } else {
      return res.status(404).json({ 
        error: 'Usuario no encontrado' 
      });
    }
    
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    return res.status(500).json({ 
      error: 'Error al eliminar el usuario',
      detalle: error.message 
    });
  }
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

router.delete('/del-file/:filename', async (req, res) => {
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
