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
/*

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
        
        //const { name, email, country, city, offer, espe, extra } = datosObjeto;//((req.body
        //const { name, email, country, city, offer, espe, extra } = datosObjeto;//((req.body
        console.log(datosObjeto);

        const user_id = req.user.id
        try {
            //updateDB("OFFERS",user_id,{name,offer,espe,extra})//,timestamp})
            //const updated = await updateOffer(user_id, {name,email,country,city,offer,espe,extra});//, ["Cardiología"]);
            const updated = await updateOffer(user_id, datosObjeto);
  
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
*/


// routes/admin.js o donde tengas tu endpoint
router.post('/update', async (req, res) => {
    try {
        const { offerId, encryptedData, timestamp } = req.body;
        
        // Desencriptar los datos
        const datosDesencriptados = await decryptData(encryptedData);
        
        console.log('🔑 ID de la oferta:', offerId);
        console.log('📦 Datos desencriptados:', datosDesencriptados);
        
        // ✅ Llamar a updateOffer con ID y datos por separado
        const resultado = await updateOffer(offerId, datosDesencriptados);
        
        res.json(resultado);
        
    } catch (error) {
        console.error('❌ Error en el servidor:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});
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
function decryptData(encryptedData) {
  
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

//====================================================

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
    const ja =JSON.stringify(a_msg)
    //console.log ("jastringify:",ja)    
    res.render('user/pagina', { o: o, a_msg: ja })
    
})

//================================================================

router.post('/message', async(req, res) => {
    try {
        //console.log('Mensaje recibido:', req.body.msg);
        let from = parseInt(req.body.from)       
        let to = parseInt(req.body.to)
        //let n = req.user.id
        //console.log("FROM_TO_N",from,to,n)
        //let msg = "user"+n+":"+req.body.msg
        let from_phrase = from + "_"+req.body.from_name 
        let to_phrase = to + "_"+req.body.to_name
        //console.log("TTTTTTTTTTTTTT",req.body.to_name)
        let msg = from_phrase + ":" + req.body.msg
        
        //let lin_msg = req.body.to_name + ":" + msg
        //console.log("xxxxxxxxxxxxxxxxxxx", msg, from, to)
        
        toFileMsg(from, to, msg)
        
        let obj = await getOfferById(req.user.id)
        let obj_to = await getOfferById(to)
        //console.log("ffffffffffff==", obj)
        
        let cnts = ""
        let cnts_to = ""
        if('cnts' in obj && obj.cnts !== null) {
            if(obj.cnts.trim().startsWith("[") && obj.cnts.trim().endsWith("]")){    
                cnts = obj.cnts
            }
            else    
            {
                cnts = "[]"    
            }
            //console.log(",,,,hay cnts...")
        } else {
            //console.log(",,,,NO hay cnts...")
            cnts = "[]"
        }

        if('cnts' in obj_to && obj_to.cnts !== null) {
            if(obj_to.cnts.trim().startsWith("[") && obj_to.cnts.trim().endsWith("]")){    
                cnts_to = obj_to.cnts
            }
            else    
            {
                cnts_to = "[]"    
            }
            //console.log(",,,,hay cnts...")
        } else {
            //console.log(",,,,NO hay cnts...")
            cnts_to = "[]"
        }
        
        let a_cnts = JSON.parse(cnts)

        //const existe = a_cnts.includes(parseInt(to));
        const existe = a_cnts.includes(to_phrase);
        
        if(!existe) {
            a_cnts.push(to_phrase)
            cnts = JSON.stringify(a_cnts)
            console.log("NNNNNNNNNEWW cnts!", cnts)
            
            try {
                const updated = await updateOffer(req.user.id, {cnts})
                //if (updated) {
                //    console.log("Actualización exitosa");
                //}
                //     //
                a_cnts = JSON.parse(cnts_to)
                a_cnts.push(from_phrase)
                cnts = JSON.stringify(a_cnts)

                let upt = await updateOffer(to, {cnts})
                //if (upt) {
                //    console.log("Otra actualización exitosa");
                //}
                //    //
            } catch (error) {
                console.error('Error al actualizar:', error);
                return res.status(500).json({ error: 'Error interno del servidor' }); // RETURN aquí
            }
        }
        const a_msg = fromFileMsg(from, to)
        return res.json({ status: 'ok', received: true, a_msg: a_msg }); // RETURN aquí también
        
    } catch (error) {
        console.error('Error general:', error);
        return res.status(500).json({ status: 'error', message: 'Error al procesar el mensaje' }); // RETURN aquí
    }
});

export default router