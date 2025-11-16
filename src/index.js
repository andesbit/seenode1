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
import {injectUserToViews} from './utils/jwtUtils.js';

//para uso en las pruebas..
import { seedDatabase } from './database/seed.js'
//

import cors from 'cors';

import userRoutes from './routes/user.js';
import userDataRoutes from './routes/user-data.js';
import indexRoutes from './routes/index.js';
import pruRoutes from './routes/test.js';
import adminRoutes from '../src/routes/admin.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

await getDatabase();
//
await seedDatabase()
//
await modelsPrepare(); // AWAIT ES CRUCIAL AQUI

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

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

const PORT = process.env.PORT || 80;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
