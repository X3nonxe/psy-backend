import { Server } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { Logger } from '../../infra/logging/logger';
import { redis } from '../redis/client';
import { authenticateSocket } from './socket.auth';
import { registerSocketEvents } from './socket.events';

const logger = new Logger();

export const initializeSocketServer = (app: express.Application) => {
  const server = createServer(app);
  const io = new Server(server, {
    cors: {
      origin: '*', // Sesuaikan dengan origin Flutter
      methods: ['GET', 'POST'],
    },
  });

  // Terapkan middleware auth
  io.use(authenticateSocket);

  // Daftarkan event handlers
  registerSocketEvents(io);

  return { server, io };
};