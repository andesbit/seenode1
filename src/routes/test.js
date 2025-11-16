import express from 'express';
//import CryptoJS from 'crypto-js';
import {addDocumentDB} from '../utils/database.js'
const router = express.Router();

router.get('/test', async (req, res) => 
{
    res.render('user/login', {
        //title: '←LLOGUIN',
        gifPath: '/images/loading.gif',
        gifAlt: 'Descripción del GIF'
    });    
}); 


router.post('/x', (req, res) => 
    {
    const t = addDocumentDB("OFFERS", 
        {name : "ARIG", email: "AIM"})
    //console.log ("ttttttttttttttttttt",t)
    res.json({ 
        success: true, 
        action: 'prueba',
        name: t.name,
        data: "prueba de datos"
    });
});


const secretKey = "mi-clave-secreta-32-chars-12345";
/*
router.post('/y', (req, res) => {
    try {
        const { encryptedData } = req.body;
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        const textoOriginal = bytes.toString(CryptoJS.enc.Utf8);

        console.log('Texto descifrado:', textoOriginal);
        res.json({ success: true, data: textoOriginal });
    } catch (error) {
        res.status(500).json({ error: 'Error al descifrar' });
    }
});
*/
export default router

