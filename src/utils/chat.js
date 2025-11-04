import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHAT_FILE = 'chat-history.json';
const CHAT_DIR = join(__dirname, '../../CHAT/');
const CHAT_PATH = join(CHAT_DIR, CHAT_FILE);

// Variable para almacenar mensajes
let chatHistory = [];

// Función para cargar mensajes
async function loadChatHistory() {
    try {
        const data = await fs.readFile(CHAT_PATH, 'utf8');
        chatHistory = JSON.parse(data);
        console.log('📂 Historial de chat cargado:', chatHistory.length, 'mensajes');
    } catch (error) {
        console.log('📂 Creando nuevo archivo de historial...');
        chatHistory = [];
        await saveChatHistory();
    }
}

// Función para guardar mensajes
async function saveChatHistory() {
    try {
        await fs.writeFile(CHAT_PATH, JSON.stringify(chatHistory, null, 2));
    } catch (error) {
        console.error('❌ Error guardando historial:', error);
    }
}

// Configurar Socket.IO
function setupChatSocket(io) {
    io.on('connection', async (socket) => {
        console.log('👤 Usuario conectado:', socket.id);

        // 1. ENVIAR HISTORIAL COMPLETO al nuevo usuario
        socket.emit('chat-history', chatHistory);

        // 2. RECIBIR NUEVOS MENSAJES
        socket.on('chat-message', async (data) => {
            const messageData = {
                id: Date.now(), // ID único
                user: data.user,
                message: data.message,
                timestamp: new Date().toLocaleTimeString(),
                date: new Date().toLocaleDateString()
            };

            // Agregar al historial en memoria
            chatHistory.push(messageData);
            
            // Limitar historial (opcional)
            if (chatHistory.length > 200) {
                chatHistory = chatHistory.slice(-200);
            }

            // GUARDAR EN ARCHIVO (persistencia)
            await saveChatHistory();

            // Enviar a TODOS los usuarios
            io.emit('new-message', messageData);
            
            console.log('💾 Mensaje guardado:', messageData);
        });

        // 3. USUARIO DESCONECTADO
        socket.on('disconnect', () => {
            console.log('❌ Usuario desconectado:', socket.id);
        });
    });
}

// Exportar funciones
export { loadChatHistory, setupChatSocket, chatHistory };
