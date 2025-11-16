
// L O C A L

import 'dotenv/config'; // ← Esto debe ir AL PRINCIPIO
import express from 'express';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import '../src/utils/keys.js'; // Genera las claves al iniciar
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { getDatabase } from './database/index.js';
import { modelsPrepare } from './database/models.js';
import { closeDatabase } from './database/index.js';
import { injectUserToViews } from '../src/utils/jwtUtils.js';

//para uso en las pruebas..
import { seedDatabase } from './database/seed.js'
//

import cors from 'cors';

import userRoutes from '../src/routes/user.js';
import userDataRoutes from '../src/routes/user-data.js';
import indexRoutes from '../src/routes/index.js';
import pruRoutes from '../src/routes/test.js';
import adminRoutes from '../src/routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//LOCAL:
const port = 3000;
//
const app = express();

await getDatabase();
//
await modelsPrepare(); // AWAIT ES CRUCIAL AQUI
//
await seedDatabase()
//


// Configurar CORS para desarrollo LOCAL:
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true // Permitir cookies
}));

app.use(cookieParser());

const httpServer = createServer(app);

// Configuración de Express
app.set('views', join(__dirname, 'views'));

// Servir archivos estáticos
//app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/main');
app.use(expressLayouts);
app.use(express.static('public'));   
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

// Iniciar servidor LOCAL:

httpServer.listen(port, () => {
    console.log(`🚀 Servidor con Socket.IO en http://localhost:${port}`);
});
