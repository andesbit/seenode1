import { existsSync, readFileSync, writeFileSync } from 'fs';
import CryptoJS from 'crypto-js';
import express from 'express'
import { authMiddleware } from '../utils/jwtUtils.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { updateDB, searchIdDB } from '../utils/database.js'
// Almacenar códigos temporalmente (en producción usa Redis o base de datos)
const pendingCodes = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DBPATH = join(__dirname, '../../DB/');

const router = express.Router();

// Ruta: GET /users
router.get('/', (req, res) => {
    res.render('user/index', { 
        title: 'Lista de Usuarios',
        join:"CONTENT PARA (JOIN)",
        users: ['Ana', 'Carlos', 'María'],
        headerData: {
            showBanner: true,
            bannerText: '¡Oferta especial!',
            lang:'←protolangparallel programming'
        }
    });
});

router.post('/new-user-data', async (req, res) => {
    //const { name, ole, lisa } = req.body;
    const { email } = req.body;
    
    //if (!name) {
    //    return res.status(400).json({ error: 'El campo name es requerido' });
    //}

    // Crear nuevo objeto
    const newObject = {
        //ole: ole !== undefined ? ole : 41,
        ole: 0,      
        email: email,
        //lisa: lisa !== undefined ? lisa : "I",
        updatedAt: new Date().toISOString() // Campo adicional para tracking
    };

    newObject.ole = getNumUsersDB()+1;
    let centena = obtenerCentena(newObject.ole)
    //centena = obtenerCentena(ole)
    console.log(centena)
    let fileData = "DATA/D" + centena.toString() + ".json"
    let ipath = join(DBPATH, fileData)//"DATA/"data.json");

    try {
        let dataArray = [];

        // Leer y parsear el archivo existente
        if (existsSync(ipath)) {
            try {
                const fileContent = readFileSync(ipath, 'utf8');
                if (fileContent.trim() !== '') {
                    dataArray = JSON.parse(fileContent);
                    // Asegurarse de que sea un array
                    if (!Array.isArray(dataArray)) {
                        dataArray = [];
                    }
                }
            } catch (parseError) {
                console.warn('Error parsing JSON file, starting with empty array:', parseError);
                dataArray = [];
            }
        }

        dataArray.push(newObject);

        // Escribir de vuelta al archivo
        writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');

        res.json({ 
            success: true, 
            //action: existingIndex !== -1 ? 'updated' : 'created',
            data: newObject
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

router.post('/update', authMiddleware, async (req, res) => {
    try {
        const { encryptedData, timestamp } = req.body;
        const encryptionKey = req.cookies.sessionkey;
        // 1. Validar timestamp (opcional)
        if (timestamp && Date.now() - timestamp > 300000) {
            return res.status(400).json({ error: 'Datos expirados' });
        }
        
        // 2. Descifrar y convertir a objeto
        const datosObjeto = decryptToObject(encryptedData,encryptionKey);
        
        // 3. Los datos ya están como objeto JavaScript
        console.log('Datos recibidos como objeto:', datosObjeto);
        console.log('Tipo:', typeof datosObjeto); // object
        console.log('Propiedades:', Object.keys(datosObjeto));
        
        const { name, offer, espe } = datosObjeto;//((req.body
        const user_id = req.user.id

        try {
            updateDB("DATA",user_id,{name,offer,espe})

            res.json({ 
                success: true           
            });

        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error interno del servidor' });
        }

    } catch (error) {
        console.error('Error al descifrar objeto:', error);
        res.status(400).json({ error: 'Error al procesar datos cifrados' });
    }
});

function decryptToObject(encryptedData,encryptionKey) {
    try {
        
        const bytes = CryptoJS.AES.decrypt(encryptedData, encryptionKey);
        const jsonString = bytes.toString(CryptoJS.enc.Utf8);
        
        if (!jsonString) {
            throw new Error('Datos cifrados inválidos o clave incorrecta');
        }
        
        return JSON.parse(jsonString);
    } catch (error) {
        throw new Error('Error al descifrar objeto: ' + error.message);
    }
}

router.post('/delete-user-data', authMiddleware, async (req, res) => {

    const { ole } = req.body;
    const centena = obtenerCentena(ole)
    console.log("CENTENA",centena)
    let fileData = "DATA/D" + centena.toString() + ".json"
    let ipath = join(DBPATH, fileData)//"DATA/"data.json");

    try {
        let dataArray = [];

        // Leer y parsear el archivo existente
        if (existsSync(ipath)) {
            try {
                const fileContent = readFileSync(ipath, 'utf8');
                if (fileContent.trim() !== '') {
                    dataArray = JSON.parse(fileContent);
                    // Asegurarse de que sea un array
                    if (!Array.isArray(dataArray)) {
                        dataArray = [];
                    }
                }
            } catch (parseError) {
                console.warn('Error parsing JSON file, starting with empty array:', parseError);
                dataArray = [];
            }
        }

        // Buscar índice del objeto existente
        const existingIndex = dataArray.findIndex(item => item.ole === ole);
        console.log(">>>>>>>>>>>>>>>>>existingIndex>>>>>>>",existingIndex)
        
        if (existingIndex !== -1) {
            dataArray.splice(existingIndex, 1);
            //let filtered = dataArray.filter(o => o.name !== 'John');
            writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');
        }
        res.json({ 
            success: true, 
            action: 'deleted',
            data: existingIndex
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Ruta para contenido ADMIN solo
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
                estadisticas: { /* datos sensibles */ }
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'Error en panel admin' });
    }
});

function toFileMsg(from, to, new_msg){
    let first = 0;    let second = 0;
    if(from < to)
    {
        first = from
        second = to
        console.log("DDDDDDDDD")
    }
    else {
        first = to
        second = from
    }

    const namef = first+"_"+second+".json"
    //console.log("namefffff",namef)
    //return namef
    let ipath = DBPATH + "MESSAGES" + "/" + namef;
    
    let dataArray = [];

    // Leer y parsear el archivo existente
    try {
        //const fileContent = readFileSync(ipath, 'utf8');
        if (existsSync(ipath)) 
        {
            let messages = readFileSync(ipath, 'utf8');
            if (messages.trim() !== '') {
                dataArray = JSON.parse(messages);
                // Asegurarse de que sea un array
                if (!Array.isArray(dataArray)) {
                    dataArray = [];
                }
            }
        }
        //dataArray.push(newObject);
        dataArray.push(new_msg);
        // Escribir de vuelta al archivo
        writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');
        //              
    } catch (parseError) {
        console.warn('Error parsing JSON file, starting with empty array:', parseError)
        dataArray = []               
    }
}

function fromFileMsg(from, to){
    let first = 0;    let second = 0;
    if(from < to)
    {
        first = from
        second = to
        //console.log("DDDDDDDDD")
    }
    else {
        first = to
        second = from
    }

    const namef = first+"_"+second+".json"
    //console.log("namefffff",namef)
    //return namef
    let ipath = DBPATH + "MESSAGES" + "/" + namef;
    
    let dataArray = [];

    // Leer y parsear el archivo existente
    try {
        //const fileContent = readFileSync(ipath, 'utf8');
        if (existsSync(ipath)) 
        {
            let messages = readFileSync(ipath, 'utf8');
            if (messages.trim() !== '') {
                dataArray = JSON.parse(messages);
                // Asegurarse de que sea un array
                if (!Array.isArray(dataArray)) {
                    dataArray = [];
                }
            }
        }
        return dataArray;
    } catch (parseError) {
        console.warn('Error parsing JSON file, starting with empty array:', parseError)
        dataArray = []
    }    
    return dataArray;
}

router.get('/pagina/:n', (req, res) => {    
    const o = searchIdDB("OFFERS", req.params.n);
    let from = 0;
    if (req.user){ //VIENE DEL INJECTUSER
        from = req.user.id
    }
    const to = parseInt(req.params.n)
    const a_msg = fromFileMsg(from, to)
    res.render('user/pagina', { o: o, a_msg:a_msg })
})

router.post('/message', (req, res) => 
{
    try {
        console.log('Mensaje recibido:', req.body.msg);
        let from = parseInt(req.body.from)
        //console.log("FROMRECIBIDO",from)
        let to = parseInt(req.body.to)
        let n = req.user.id
        let msg = n+":"+req.body.msg
        toFileMsg(from, to, msg)            // TO__FILE.
        const a_msg = fromFileMsg(from, to) // FROMFILE.
        res.json({ status: 'ok', received: true,a_msg:a_msg });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al procesar el mensaje' });
    }
});

export default router