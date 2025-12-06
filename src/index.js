/**
 * ============================================
 * DISCLAIMER LEGAL
 * ============================================
 * 
 * Este software se proporciona "TAL CUAL" sin garantías de ningún tipo.
 * Los desarrolladores NO se hacen responsables de:
 * - Pérdida de datos
 * - Uso indebido de la información
 * - Violaciones de privacidad
 * - Cualquier daño derivado del uso
 * 
 * USO BAJO SU PROPIO RIESGO.
 * 
 * Copyright (c) 2025 Ofertio
 * Licencia: MIT (Ver LICENSE)
 * ============================================
 */


//ENPACKAGEJSONAORAimport 'dotenv/config'; // ← Esto debe ir AL PRINCIPIO
import express from 'express';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import './utils/keys.js'; // Genera las claves al iniciar
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { existsSync, mkdirSync } from 'fs'; // ← AÑADE ESTO
import { getDatabase } from './database/index.js';
import { modelsPrepare } from './database/models.js';
import { closeDatabase } from './database/index.js';
import {injectUserToViews} from './utils/jwtUtils.js';
//import { seedDatabase } from './database/seed.js'
import cors from 'cors';
import userRoutes from './routes/user.js';
import userDataRoutes from './routes/user-data.js';
import indexRoutes from './routes/index.js';
import testRoutes from './routes/test.js';
import adminRoutes from './routes/admin.js';
import legalRoutes from './routes/legal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// CREAR CARPETA DATA ANTES DE CONECTAR A LA BD
const dbPath = join(__dirname, 'data');
if (!existsSync(dbPath)) {
    mkdirSync(dbPath, { recursive: true });
    console.log('📁 Carpeta data creada en:', dbPath);
}

// AHORA SÍ CONECTAR
await getDatabase();
await modelsPrepare(); // AWAIT ES CRUCIAL AQUI
//await seedDatabase()

/*
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
//*/
/*
// Configurar CORS para desarrollo LOCAL:
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true // Permitir cookies
}));
//*/

// Configurar CORS
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

const corsOptions = {
    origin: IS_PRODUCTION
        ? process.env.FRONTEND_URL || 'https://ofertio.net'
        : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
};

app.use(cors(corsOptions));

// Log para debugging
console.log(`🔐 CORS: ${IS_PRODUCTION ? 'Producción' : 'Desarrollo'}`);
if (IS_PRODUCTION && process.env.FRONTEND_URL) {
    console.log(`   Origen permitido: ${process.env.FRONTEND_URL}`);
}


app.use(cookieParser());
const httpServer = createServer(app);

// Configuración de Express
app.set('views', join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(express.static('public')); 
app.use(express.json());
app.use(injectUserToViews);

// Rutas
app.use('/user', userRoutes);
app.use('/user-data', userDataRoutes);
app.use('/test', testRoutes);
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);
app.use('/', legalRoutes);  // ← (debe ir después de las otras)

// Asegúrate de cerrar la conexión si el proceso se detiene
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando el servidor...');
    await closeDatabase();
    process.exit(0);
});
///*
// Iniciar servidor
/*
const PORT = process.env.PORT || 80;
httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
});
*/
//*/
/*
httpServer.listen(3000, () => {
    console.log(`🚀 Servidor en http://localhost:3000`);
});
//*/


// Iniciar servidor
const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
//const IS_PRODUCTION = process.env.NODE_ENV === 'production';

httpServer.listen(PORT, HOST, () => {
    console.log('\n' + '='.repeat(60));
    console.log(`🚀 SERVIDOR INICIADO`);
    console.log('='.repeat(60));
    console.log(`   Entorno:        ${IS_PRODUCTION ? '🏭 PRODUCCIÓN' : '💻 DESARROLLO'}`);
    console.log(`   Puerto:         ${PORT}`);
    console.log(`   Host:           ${HOST}`);
    console.log(`   Base de datos:  ${process.env.DATABASE_URL ? '🐘 PostgreSQL' : '💾 SQLite'}`);
    
    if (!IS_PRODUCTION) {
        console.log(`   URL Local:      http://localhost:${PORT}`);
    }
    
    console.log('='.repeat(60) + '\n');
});

httpServer.on('error', (error) => {
    console.error('\n' + '❌'.repeat(30));
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ El puerto ${PORT} ya está en uso`);
        console.error(`💡 Soluciones:`);
        console.error(`   1. Cierra la aplicación que usa el puerto ${PORT}`);
        console.error(`   2. Cambia el puerto en .env: PORT=3001`);
    } else {
        console.error('❌ Error al iniciar servidor:', error.message);
    }
    console.error('❌'.repeat(30) + '\n');
    process.exit(1);
});