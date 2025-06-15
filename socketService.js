import { io } from 'socket.io-client';
import config from '../config/env';

let socket = null;
let connectionPromise = null;

const socketService = {
  connect: () => {
    if (socket && socket.connected) {
      return Promise.resolve(socket);
    }
    if (connectionPromise) {
      return connectionPromise;
    }

    connectionPromise = new Promise((resolve, reject) => {
      const socketUrl = config.api.socketUrl || 'http://localhost:5000';
      console.log('Attempting to connect to socket server at:', socketUrl);
      socket = io(socketUrl, {
        reconnectionAttempts: 5,
        timeout: 10000,
        transports: ['websocket']
      });

      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        connectionPromise = null; // Clear the promise once connected
        resolve(socket);
      });

      socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        socket = null; // Clear socket on disconnect
        connectionPromise = null; // Clear promise on disconnect
      });

      socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
        connectionPromise = null; // Clear promise on error
        reject(new Error(`Socket connection failed: ${error.message}`));
      });
    });
    return connectionPromise;
  },

  disconnect: () => {
    if (socket && socket.connected) {
      console.log('Disconnecting socket...');
      socket.disconnect();
      socket = null;
      connectionPromise = null;
    }
  },

  getSocket: () => {
    return socket;
  },

  emit: (event, data, callback) => {
    if (socket && socket.connected) {
      console.log(`Emitting event: ${event}`, data);
      socket.emit(event, data, callback);
    } else {
      console.warn(`Socket not connected, cannot emit event: ${event}`);
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  },

  on: (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    } else {
      console.warn(`Socket not initialized, cannot listen to event: ${event}`);
    }
  },

  off: (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  },

  // Host specific methods
  joinAsHost: (roomCode, hostPin, callback) => {
    if (socket && socket.connected) {
      socket.emit('joinAsHost', { roomCode, hostPin }, callback);
    } else {
      console.warn('Socket not connected, cannot join as host');
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  },

  startQuiz: (roomCode, callback) => {
    if (socket && socket.connected) {
      socket.emit('startQuiz', { roomCode }, callback);
    } else {
      console.warn('Socket not connected, cannot start quiz');
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  },

  cancelQuiz: (roomCode, callback) => {
    if (socket && socket.connected) {
      socket.emit('cancelQuiz', { roomCode }, callback);
    } else {
      console.warn('Socket not connected, cannot cancel quiz');
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  },

  hostNextQuestion: (roomCode, callback) => {
    if (socket && socket.connected) {
      socket.emit('hostNextQuestion', { roomCode }, callback);
    } else {
      console.warn('Socket not connected, cannot advance question');
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  },

  // Participant specific methods
  joinAsParticipant: (roomCode, username, callback) => {
    if (socket && socket.connected) {
      socket.emit('joinRoom', { roomCode, username }, callback);
    } else {
      console.warn('Socket not connected, cannot join as participant');
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  },

  submitAnswer: (roomCode, questionIndex, answer, timeRemaining, callback) => {
    if (socket && socket.connected) {
      socket.emit('submitAnswer', { roomCode, questionIndex, answer, timeRemaining }, callback);
    } else {
      console.warn('Socket not connected, cannot submit answer');
      if (callback) {
        callback({ success: false, message: 'Socket not connected' });
      }
    }
  }
};

export default socketService; 