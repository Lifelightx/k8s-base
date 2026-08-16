/**
 * Minimal levelled logger with ISO timestamps.
 * Levels: info | warn | error | debug
 */

const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 };
const COLORS = {
  debug: '\x1b[36m', // cyan
  info:  '\x1b[32m', // green
  warn:  '\x1b[33m', // yellow
  error: '\x1b[31m', // red
  reset: '\x1b[0m',
};

const currentLevel = LEVELS[process.env.LOG_LEVEL] ?? LEVELS.info;

function log(level, ...args) {
  if (LEVELS[level] < currentLevel) return;

  const ts = new Date().toISOString();
  const color = COLORS[level] ?? '';
  const tag = `${color}[${level.toUpperCase()}]${COLORS.reset}`;
  const out = level === 'error' ? console.error : console.log;
  out(`${ts} ${tag}`, ...args);
}

const logger = {
  debug: (...args) => log('debug', ...args),
  info:  (...args) => log('info',  ...args),
  warn:  (...args) => log('warn',  ...args),
  error: (...args) => log('error', ...args),
};

module.exports = logger;
