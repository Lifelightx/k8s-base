const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${req.method} ${req.originalUrl} → ${err.message}`);
  if (err.stack) logger.debug(err.stack);

  const status = err.status || 500;
  res.status(status).json({
    message: err.message || 'Internal Server Error',
  });
};

module.exports = errorHandler;
