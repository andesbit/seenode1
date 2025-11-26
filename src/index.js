import 'dotenv/config'; // ← Esto debe ir AL PRINCIPIO
import express from 'express';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import './utils/keys.js'; // Genera las claves al iniciar
import { mkdirSync, existsSync } from 'fs';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './database/index.js';
import { modelsPrepare } from './database/models.js';
import { closeDatabase } from './database/index.js';
import {injectUserToViews} from './utils/jwtUtils.js';
//import { seedDatabase } from './database/seed.js'
import cors from 'cors';
import userRoutes from './routes/user.js';
import userDataRoutes from './routes/user-data.js';
import indexRoutes from './routes/index.js';
import pruRoutes from './routes/test.js';
import adminRoutes from './routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const app = express();

const dbPath = path.join(__dirname, 'data');
if (!existsSync(dbPath)) {
    mkdirSync(dbPath, { recursive: true });
    console.log('📁 Carpeta data creada');
}

await getDatabase();
//
await modelsPrepare(); // AWAIT ES CRUCIAL AQUI
//
//await seedDatabase()
//
///*
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

app.use(cookieParser());

const httpServer = createServer(app); // Crear servidor HTTP

// Configuración de Express
app.set('views', join(__dirname, 'views'));

app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);
//app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('public')); // servir archivos estáticos.   
app.use(express.json());
app.use(injectUserToViews); // Para TODAS las vistas

// Rutas
app.use('/user', userRoutes);
app.use('/user-data', userDataRoutes);
app.use('/test', pruRoutes);
app.use('/', indexRoutes);
app.use('/admin', adminRoutes);

// Asegúrate de cerrar la conexión si el proceso se detiene
process.on('SIGINT', async () => {
    console.log('\n🛑 Cerrando el servidor...');
    await closeDatabase();
    process.exit(0);
});

// Iniciar servidor
///*
const PORT = process.env.PORT || 80;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
//*/
/*
httpServer.listen(3000, () => {
    console.log(`🚀 Servidor con Socket.IO en http://localhost:3000`);
});
//*/