import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import {getOfferById} from '../database/search.js'
//import crypto from 'crypto';
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = '7d'; // 7 días de expiración

function generateToken(payload) 
{
    return jwt.sign(
        {
            id: payload.id,
            name: payload.name,
            email: payload.email,
            role: payload.role || 'user'            
        },
        JWT_SECRET,
        { 
            expiresIn: JWT_EXPIRES_IN,
            issuer: 'ofertio',
            audience: 'users&offers'
        }
    );
}

// Verificar token JWT
function verifyToken(token) 
{
    try {
        //console.log("==>>verifyTokenFJWT_SECRET_BORRAR",JWT_SECRET)
        return jwt.verify(token, JWT_SECRET, {
            issuer: 'ofertio',
            audience: 'users&offers'
        });
    } catch (error) {
        console.log("verifyerror")
        throw new Error('Token inválido o expirado');
    }
}

// Hashear código de verificación (para códigos de 6 dígitos)
async function hashCode(code) {
    const saltRounds = 10;
    return await bcrypt.hash(code.toString(), saltRounds);
}

// Verificar código hasheado
async function verifyCode(plainCode, hashedCode) {
    return await bcrypt.compare(plainCode.toString(), hashedCode);
}

// Middleware para verificar autenticación
function authMiddleware(req, res, next) {
    const token = req.cookies.authToken || req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {        
        return res.status(401).json({ error: 'Acceso no autorizado CARALLO' })
    }

    try {
        const decoded = verifyToken(token);
        req.user = decoded; // Agregar info del usuario al request
        next();
    } catch (error) {        
        return res.status(401).json({ error: 'Token inválido' });
    }
}
/*
const injectUserToViews = (req, res, next) => {
    const token = req.cookies.authToken;
    
    // Valores por defecto
    res.locals.isAuthenticated = false;
    res.locals.user = null;
    
    if (token) {
        try {
           const decoded = jwt.verify(token, JWT_SECRET, {
                      issuer: 'ofertio',
                      audience: 'users&offers'
                  });
            //const decoded = jwt.verify(token, process.env.JWT_SECRET);
            res.locals.user = decoded;
            res.locals.isAuthenticated = true;
        } catch (error) {
            console.log(" index.ls injectUsertoviews Token inválido - limpiar cookie")
            res.clearCookie('authToken');
        }
    }
    
    next();
};
*/



const injectUserToViews = async(req, res, next) => {
    // Valores por defecto
    res.locals.isAuthenticated = false;
    res.locals.user = null;
    
    //console.log('🔐 InjectUserToViews ejecutado para:', req.url);
    //console.log('📦 Cookies disponibles:', req.cookies);
    
    // Verificar SI cookies existe primero
    const token = req.cookies ? req.cookies.authToken : null;
    
    if (token) {
        //console.log('✅ authToken encontrado');
        try {
            const decoded = jwt.verify(token, JWT_SECRET, {
                issuer: 'ofertio',
                audience: 'users&offers'
            });
            //console.log("\ndecoded:",decoded)
            //console.log("\nend decodedddddd\n")
            
            res.locals.user = decoded;

            /*correct name:
                obtain name:
                    databasegetname del id => name 
                change name: 
                    set name:*/
                let un = await getOfferById(res.locals.user.id)
                res.locals.user.name= un.name//"pliki"  
                res.locals.user.role= un.role


            res.locals.isAuthenticated = true;
            req.user = decoded;             
            //console.log('✅ Usuario autenticado:', decoded.email);
        } catch (error) {
            console.log("❌ Token inválido - limpiar cookie", error.message);
            res.clearCookie('authToken');
        }
    } else {
        console.log('❌ No hay authToken en cookies');
    }
    
    next();
};



const requireAuthView = (req, res, next) => {
    if (!res.locals.isAuthenticated) {        
        return res.redirect('/user/login');
    }
    next();
};

const requireRole = (role) => {
    return (req, res, next) => {
        if (!res.locals.isAuthenticated) {            
            return res.redirect('/user/login');
        }
        
        if (res.locals.user.role !== role) {           
            return res.redirect('/');
        }
        
        next();
    };
};

export {
    generateToken,
    verifyToken,
    hashCode,
    verifyCode,
    authMiddleware,
    JWT_SECRET,
    injectUserToViews,
    requireAuthView,
    requireRole
};