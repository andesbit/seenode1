import fs from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const CHAT_DIR = join(__dirname, '../CHAT/');

// Objeto para almacenar historial de cada sala en memoria
const roomHistories = new Map();

// ============================================
// FUNCIONES AUXILIARES
// ============================================

// Generar ID único de sala entre dos usuarios
function generateRoomId(userId1, userId2) {
  const users = [userId1, userId2].sort(); // Ordenar alfabéticamente
  return `private_${users[0]}_${users[1]}`;
}

// Obtener ruta del archivo de una sala
function getRoomFilePath(roomId) {
  return join(CHAT_DIR, `${roomId}.json`);
}

// Verificar si una sala existe
async function roomExists(roomId) {
  try {
    const roomPath = getRoomFilePath(roomId);
    await fs.access(roomPath);
    return true;
  } catch (error) {
    return false;
  }
}

// Cargar historial de una sala
async function loadRoomHistory(roomId) {
  try {
    const roomPath = getRoomFilePath(roomId);
    const data = await fs.readFile(roomPath, 'utf8');
    const history = JSON.parse(data);
    roomHistories.set(roomId, history);
    console.log(`📂 Historial de sala "${roomId}" cargado:`, history.length, 'mensajes');
    return history;
  } catch (error) {
    console.log(`📂 Creando nuevo historial para sala "${roomId}"...`);
    const newHistory = [];
    roomHistories.set(roomId, newHistory);
    await saveRoomHistory(roomId);
    return newHistory;
  }
}

// Guardar historial de una sala
async function saveRoomHistory(roomId) {
  try {
    const roomPath = getRoomFilePath(roomId);
    const history = roomHistories.get(roomId) || [];
    
    // Crear directorio si no existe
    await fs.mkdir(CHAT_DIR, { recursive: true });
    
    await fs.writeFile(roomPath, JSON.stringify(history, null, 2));
  } catch (error) {
    console.error(`❌ Error guardando historial de sala "${roomId}":`, error);
  }
}

// Obtener historial (desde memoria o cargar)
async function getRoomHistory(roomId) {
  if (!roomHistories.has(roomId)) {
    return await loadRoomHistory(roomId);
  }
  return roomHistories.get(roomId);
}

// ============================================
// FUNCIÓN PRINCIPAL: setupPrivateChatSocket
// ============================================

function setupPrivateChatSocket(io) {
  console.log('🔧 Configurando Socket.IO para chat privado...');
  
  io.on('connection', async (socket) => {
    console.log('👤 Usuario conectado:', socket.id);
    
    let currentRoom = null;
    let currentUserId = null;

    // EVENTO 1: Inicializar chat
    socket.on('init-private-chat', async (data) => {
      console.log('📨 Recibido init-private-chat:', data);
      
      const { userId1, userId2, currentUser } = data;
      
      if (!userId1 || !userId2) {
        socket.emit('error', { message: 'IDs de usuario inválidos' });
        return;
      }

      const roomId = generateRoomId(userId1, userId2);
      currentRoom = roomId;
      currentUserId = currentUser;

      socket.join(roomId);
      
      const exists = await roomExists(roomId);
      
      if (exists) {
        console.log(`♻️ Activando sala existente: ${roomId}`);
      } else {
        console.log(`🆕 Creando nueva sala: ${roomId}`);
      }

      const roomHistory = await getRoomHistory(roomId);

      socket.emit('chat-initialized', {
        roomId: roomId,
        messages: roomHistory,
        isNewChat: !exists,
        participants: [userId1, userId2]
      });

      socket.to(roomId).emit('user-online', {
        userId: currentUserId,
        timestamp: new Date().toLocaleTimeString()
      });

      console.log(`💬 Chat iniciado: ${userId1} ↔ ${userId2} (Sala: ${roomId})`);
    });

    // EVENTO 2: Enviar mensaje
    socket.on('send-message', async (data) => {
      if (!currentRoom) {
        socket.emit('error', { message: 'Chat no inicializado' });
        return;
      }

      const messageData = {
        id: Date.now(),
        senderId: data.senderId,
        senderName: data.senderName,
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
        roomId: currentRoom
      };

      // Agregar al historial
      const roomHistory = await getRoomHistory(currentRoom);
      roomHistory.push(messageData);

      // Limitar historial
      if (roomHistory.length > 500) {
        roomHistories.set(currentRoom, roomHistory.slice(-500));
      }

      // Guardar en archivo
      await saveRoomHistory(currentRoom);

      // Enviar a todos en la sala
      io.to(currentRoom).emit('new-message', messageData);

      console.log(`💬 Mensaje en sala "${currentRoom}":`, messageData.message);
    });

    // EVENTO 3: Typing
    socket.on('typing', (data) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('user-typing', {
          userId: data.userId,
          userName: data.userName,
          isTyping: data.isTyping
        });
      }
    });

    // EVENTO 4: Marcar como leído
    socket.on('mark-as-read', async (data) => {
      if (currentRoom) {
        socket.to(currentRoom).emit('messages-read', {
          userId: currentUserId,
          timestamp: new Date().toISOString()
        });
      }
    });

    // EVENTO 5: Desconexión
    socket.on('disconnect', () => {
      if (currentRoom) {
        socket.to(currentRoom).emit('user-offline', {
          userId: currentUserId,
          timestamp: new Date().toLocaleTimeString()
        });
      }
      console.log('❌ Usuario desconectado:', socket.id);
    });
  });
  
  console.log('✅ Socket.IO configurado correctamente');
}

// Función para inicializar (crear carpeta CHAT)
async function initializePrivateChatSystem() {
  try {
    await fs.mkdir(CHAT_DIR, { recursive: true });
    console.log('✅ Sistema de chat privado inicializado');
  } catch (error) {
    console.error('❌ Error inicializando sistema:', error);
  }
}

// Exportar funciones
export { 
  setupPrivateChatSocket,
  initializePrivateChatSystem,
  getRoomHistory
};