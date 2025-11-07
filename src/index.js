import 'dotenv/config'; // ← Esto debe ir AL PRINCIPIO
import express from 'express';
import cookieParser from 'cookie-parser';
import expressLayouts from 'express-ejs-layouts';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import {injectUserToViews} from './utils/jwtUtils.js';

import './config/database.js'; // ← Import para inicializar el pool

//PARA DESARROLLA:
import cors from 'cors';

//ENDPARADEASRRO
//import userDataRoutes from './routes/user-data.js';
import userRoutes from './routes/user.js';
import userDataRoutes from './routes/user-data.js';
import indexRoutes from './routes/index.js';
import chatRoutes from './routes/chat.js';
import pruRoutes from './routes/prueba.js';

// Importar funciones del chat
import { loadChatHistory, setupChatSocket } from './utils/chat.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = 3000;
const app = express();
/*
// Configurar CORS para desarrollo
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true // Permitir cookies
}));
*/
/*
// En tu código
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
*/
app.use(cors({
  origin: true, // Permite cualquier origen (NO recomendado para producción)
  credentials: true
}));

app.use(cookieParser());

// 1. Crear servidor HTTP
const httpServer = createServer(app);

// 2. Inicializar Socket.IO
const io = new Server(httpServer);

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
app.use('/chat', chatRoutes);
app.use('/prueba', pruRoutes);
app.use('/', indexRoutes);

// Cargar historial del chat al iniciar
loadChatHistory().then(() => {
    console.log('✅ Servidor iniciado con historial cargado');
});

// Configurar Socket.IO para el chat
setupChatSocket(io);

// Iniciar servidor
/*
httpServer.listen(port, () => {
    console.log(`🚀 Servidor con Socket.IO en http://localhost:${port}`);
});
*/
//PRODUCTION:
const PORT = process.env.PORT || 80;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});