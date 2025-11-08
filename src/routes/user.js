import express from 'express'
import { generateToken, hashCode, verifyCode, requireAuthView } from '../utils/jwtUtils.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { addDocumentDB,searchIdDB, searchInDB } from '../utils/database.js'
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "andesbitsoftware@gmail.com",
    pass: process.env.GOOGLE_APP_PASSWORD2
  },
});

const pendingCodes = new Map();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DBPATH = join(__dirname, '../DB/');

const router = express.Router();

router.get('/login', async (req, res) => 
{
    res.render('user/login', {
        //title: '←LLOGUIN',
        gifPath: '/images/loading.gif',
        gifAlt: 'Descripción del GIF'
    });    
}); 

//DEBERIA ESTAR EN USER_DATA PERO ESE ARCHIVO VA A CRECER 
//ADEMAS PARA QUE ESTE EN USERS Y NO EN OPERACIONES POST SUBSECUENTES 
//router.get('/mi-oferta',authMiddleware, (req, res) => 

    //TEMPORALMENTE PARA PROBAR EL ESTILO quitamos requireAuthView,
router.get('/mi-oferta', (req, res) => 
//router.get('/mi-oferta',requireAuthView, (req, res) => 
{
    //ENVIAR LA KOOKIEde ecriptacion AQUI
    res.clearCookie('datos', { httpOnly: false });
    const clave = crypto.randomBytes(32).toString('hex');
    //console.log("CCCCCusersmiofertaCCCCCCCCCCC", clave);
    res.cookie('datos', JSON.stringify({ dato1: clave }), { httpOnly: false });

    const o = searchIdDB("OFFERS", req.user.id);
    let array = o.cnts
    
    res.render('user/mi←oferta', {
        title: '←Acerca de....',
        cnts:array
    });    

}); 

router.post('/send-code', async (req, res) => 
{
    const { email } = req.body;
    
    // Generar código de 6 dígitos
    const code = crypto.randomInt(100000, 999999).toString();
       
    // Hashear el código antes de almacenarlo
    const hashedCode = await hashCode(code.toString());
    
    pendingCodes.set(email, {
        code: hashedCode, // Almacenar el código HASHEADO
        expires: Date.now() + 15 * 60 * 1000 // 15 minutos
    });

    const mailOptions = {
        from: 'Ofertio <andesbitsoftware@gmail.com>',
        to: email,
        subject: 'Tu código de acceso - Ofertio',
        html: `
            <h2>Tu código de acceso</h2>
            <p>Usa este código para iniciar sesión:</p>
            <h1 style="color: #007bff; font-size: 32px;">${code}</h1>
            <p>El código expira en 15 minutos.</p>
        `
    };
    
    try {
        await transporter.sendMail(mailOptions);
        res.json({ success: true });
    } catch (error) {
        console.error('>>>>Error enviando email:', error);
        res.status(500).json({ error: 'Error enviando código' });
    }
});

/*   const cookieOptions = [
    `authToken=${token}`,
    'path=/',
    'max-age=604800', // 7 días
    //'secure', // Solo HTTPS //PROD
    'samesite=strict'];     */

router.post('/logout', (req, res) => {
    // Eliminar la cookie HttpOnly
    //console.log("LOGOU.TUSERsalida exitosa")
    res.cookie('authToken', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        expires: new Date(0) // 👈 Expirar inmediatamente
    });
    res.clearCookie('datos', { httpOnly: false });    
    res.json({ success: true, message: 'Sesión cerrada' });
});

// Verificar código

router.post('/verify-code', async (req, res) =>
{
    const { email, code } = req.body;
    
    const stored = pendingCodes.get(email);
    
    if (!stored) {
        return res.status(400).json({ error: 'Código no encontrado' });
    }
    
    if (Date.now() > stored.expires) {
        pendingCodes.delete(email);
        return res.status(400).json({ error: 'Código expirado' });
    }
    // Verificar el código con el hash almacenado
    const isValid = await verifyCode(code, stored.code);
    
    if (!isValid) {
        return res.status(400).json({ error: 'Código incorrecto' });
    }    

    //GENERAR ID
    let ID = 0
    let a= searchInDB ("OFFERS", "email", email);

    if (Array.isArray(a) && a.length > 0) {
        ID = a[0].ole
        console.log("·····/verifycode¡EXISTE!")
    }    
    else{ // LUEGO GENERAR SI NO EXISTE
        let o = {ole: 0, name:"", email: email, role: "user"}
        const t = addDocumentDB("OFFERS", o)
        if (t.success) 
        {
            console.log ("···verifycode se AGREGÓ DOCUMENTO",t);
            ID = t.data.ole
        }    
        else console.log ("···········verifycode···",t);
    }    

    const NAME = "usuario"+ID;
    console.log("/verify-code>>>>>EMAIL",email,">>>>ID:",ID)  
    const token = generateToken({
        //id: Date.now().toString(), // ID único
        id: ID,
        name: NAME, 
        email: email,
        role: 'user'
    });
    pendingCodes.delete(email);

    res.cookie('authToken', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    //en mi oferta res.cookie('datos', JSON.stringify({ dato1: 'valor1' }), { httpOnly: false });

    res.json({ //CREO QUE SI USA ESTOS DATOS
        token: token,
        user: {
            id: ID,
            email: email,
            role: 'user'
        }
    });
});

export default router
