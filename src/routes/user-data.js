import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { unlink } from 'fs/promises';
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
import { deleteOffer } from '../database/crud/delete.js';

// Almacenar códigos temporalmente (en producción usa Redis o base de datos)
//const pendingCodes = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DBPATH = join(__dirname, '../../DB/');

const router = express.Router();

router.post('/update', async (req, res) => {
    try {
        const { offerId, encryptedData, timestamp } = req.body;
        
        // Desencriptar los datos
        const datosDesencriptados = await decryptData(encryptedData);
        
        //console.log('🔑 ID de la oferta:', offerId);
        //console.log('📦 Datos desencriptados:', datosDesencriptados);
        
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

// Ruta para guardar el logo
router.post('/update-logo', async (req, res) => {
  const { logo } = req.body;
  const userId = req.user.id;
  
  try {
    await updateOffer(userId, { logo });
    res.json({ success: true, message: 'Logo actualizado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

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

async function delFileMsg(from, to){

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
    
    const dirPath = dirname(ipath); // Obtiene '/usr/src/app/DB/MESSAGES'

    if (!existsSync(dirPath)) return
    if (!existsSync(ipath)) return
    
    try {        
        await unlink(ipath);        
    } catch (error) {
        console.error('Error al eliminar el archivo de mensajes:', error);        
    }        
}

// Ruta para contenido ADMIN solo
function toFileMsg(from, to, new_msg){

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
    
    const dirPath = dirname(ipath); // Obtiene '/usr/src/app/DB/MESSAGES'

    // Crear la carpeta si no existe (recursive: true crea todas las carpetas necesarias)
    if (!existsSync(dirPath)) {
        console.log(`📁 Creando carpeta: ${dirPath}`);
        mkdirSync(dirPath, { recursive: true });
    }

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
        
        //console.log("_______________msg______",new_msg)
        //console.log("_______________array______",dataArray)
        //console.log("______________stringify_a_______",JSON.stringify(dataArray))
                
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
    //console.log("0o/pagina/:n",o)    
    if (!o) {
        //Borrar el contacto de la ofeta propia:
        const yo = await getOfferById(req.user.id)//(123);
        let subcadena = req.params.n.toString() + "_"
        //var cnts = yo.cnts.filter(function(elemento) {return !elemento.includes('xyz');});
        //let array = yo.cnts.split(',')
        let array = JSON.parse(yo.cnts)        
        const cnts = array.filter(elemento => !elemento.startsWith(subcadena));
        //const existe = a_cnts.includes(to_phrase);
        //console.log("---------array_>",array)
        //const cnts = array.filter(elemento => !elemento.startsWith(subcadena));
        //console.log("---------cnts_>",cnts)
        yo.cnts = JSON.stringify(cnts) //cnts.join(',');
        //console.log("---------yocnts_>",yo.cnts)
        
        await updateOffer(req.user.id, yo);
        await delFileMsg(req.user.id,req.params.n)

        res.render('user/deleted', {  })
        return
    }  

    let from = 0;
    if (req.user){ //VIENE DEL INJECTUSER
        from = req.user.id
        //console.log( "YONIPACHECO",req.user)

    }
    const to = parseInt(req.params.n)
    const a_msg = [];//fromFileMsg(from, to)
    const ja =JSON.stringify(a_msg)

    //console.log ("jastringify:",ja)  
    //console.log ("from,to,name",from,"|",to,"|",o.name)  
    let nombre_propio =""
    if(req.user)
     nombre_propio = req.user.name

    res.render('user/pagina', { 
        o: o, 
        a_msg: ja,
        userId1: from,
        userId2: to,
        currentUserId: from,//req.session.userId,
        currentUserName: nombre_propio//era La otra persona o.name //req.session.userName 
    })
    
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

const SaveDeletes=(id)=>{    
    try{
    let ids = readFileSync("DELETESFILE.json", 'utf8');
    ids.push(id)
    fs.writeFileSync("DELETESFILE.json", JSON.stringify(dataArray, null, 2), 'utf8'); 
    }
    catch{

    }
}
router.post('/delete', async (req, res) => {
    try {
        const { offerId, timestamp } = req.body;
        
        
        console.log('🔑 ID de la oferta a borrar:', offerId);
                
        // ✅ Llamar a updateOffer con ID y datos por separado
        const resultado = await deleteOffer(offerId);
        
        SaveDeletes(offerId) 
        let r = {changes:resultado, success:true}
        res.json(r);
        
    } catch (error) {
        console.error('❌ Error en el servidor:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

export default router