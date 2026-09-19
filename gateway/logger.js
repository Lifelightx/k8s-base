const pino = require('pino');

const currentLevel = process.env.LOG_LEVEL || 'info';

const logger = pino({
  level: currentLevel,
  transport: process.env.NODE_ENV !== 'production' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
    }
  } : undefined,
});

module.exports = logger;
