import { existsSync, readFileSync, writeFileSync } from 'fs';
//import CryptoJS from 'crypto-js';
import crypto from 'crypto'
import express from 'express'
import { authMiddleware } from '../utils/jwtUtils.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {privateKey} from '../utils/keys.js';

//import { updateDB, searchIdDB } from '../utils/database.js'
import { updateOffer } from '../database/crud/update.js';
import { getOfferById } from '../database/search.js';

// Almacenar códigos temporalmente (en producción usa Redis o base de datos)
//const pendingCodes = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DBPATH = join(__dirname, '../../DB/');

const router = express.Router();

//====================================================

router.post('/update', authMiddleware, async (req, res) => {

    try {
        const { encryptedData, timestamp } = req.body;
        if (timestamp && Date.now() - timestamp > 300000) {
            return res.status(400).json({ error: 'Datos expirados' });
        }
        // 2. Descifrar y convertir a objeto
        const datosObjeto = decryptToObject(encryptedData);//,encryptionKey);
        // 3. Los datos ya están como objeto JavaScript
        //console.log('Datos recibidos como objeto:', datosObjeto);
        //console.log('Tipo:', typeof datosObjeto); // object
        //console.log('Propiedades:', Object.keys(datosObjeto));
        
        const { name, email, country, city, offer, espe, extra } = datosObjeto;//((req.body
        const user_id = req.user.id
        try {
            //updateDB("OFFERS",user_id,{name,offer,espe,extra})//,timestamp})
            const updated = await updateOffer(user_id, {name,email,country,city,offer,espe,extra});//, ["Cardiología"]);
  
            if (updated) {
                console.log("Actualización exitosa");
            }
            
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
})
/*
router.post('/__update', authMiddleware, async (req, res) => {
    try {
        const { encryptedData, timestamp } = req.body;
        //const encryptionKey = req.cookies.dato.datos1;//sessionkey;
        //const encryptionKey = JSON.parse(req.cookies.datos).dato1;
        // 1. Validar timestamp (opcional)
        if (timestamp && Date.now() - timestamp > 300000) {
            return res.status(400).json({ error: 'Datos expirados' });
        }
        
        // 2. Descifrar y convertir a objeto
        const datosObjeto = decryptToObject(encryptedData);//,encryptionKey);
        
        // 3. Los datos ya están como objeto JavaScript
        //console.log('Datos recibidos como objeto:', datosObjeto);
        //console.log('Tipo:', typeof datosObjeto); // object
        //console.log('Propiedades:', Object.keys(datosObjeto));
        
        const { name, offer, espe, extra } = datosObjeto;//((req.body
        const user_id = req.user.id

        try {
            updateDB("OFFERS",user_id,{name,offer,espe,extra})//,timestamp})



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
*/
function decryptToObject(encryptedData) {
  
  const buffer = Buffer.from(encryptedData, 'base64');

  const decrypted = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: 'SHA-256'
    },
    buffer
  );

  return JSON.parse(decrypted.toString());
}   

// Ruta para contenido ADMIN solo
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

router.get('/pagina/:n', async(req, res) => {    
    //const o = searchIdDB("OFFERS", req.params.n);
    const o = await getOfferById(req.params.n)//(123);

    if (o) {
        console.log(o);
    }
    
    
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
        console.log("xxxxxxxxxxxxxxxxxxx",msg,from,to)
        toFileMsg(from, to, msg)            // TO__FILE.
        const a_msg = fromFileMsg(from, to) // FROMFILE.
        res.json({ status: 'ok', received: true,a_msg:a_msg });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Error al procesar el mensaje' });
    }
});

export default router