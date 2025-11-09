import 'dotenv/config'; // ← Esto debe ir AL PRINCIPIO
import express from 'express';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import { createServer } from 'http';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {injectUserToViews} from './utils/jwtUtils.js';

import cors from 'cors';

import userRoutes from './routes/user.js';
import userDataRoutes from './routes/user-data.js';
import indexRoutes from './routes/index.js';
import pruRoutes from './routes/test.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

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

// Iniciar servidor

const PORT = process.env.PORT || 80;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
