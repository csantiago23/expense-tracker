import app from './app.js';
import { config } from './config/index.js';
import { prisma } from './prisma.js';

const server = app.listen(config.port, () => {
  console.log(`🚀 Expense Tracker Server running on port ${config.port} [${config.nodeEnv}]`);
});

const gracefulShutdown = async () => {
  console.log('Received shutdown signal, closing server...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Database disconnected. Server shut down cleanly.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
