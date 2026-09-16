const logger = require('../utils/logger');
const { llmQueue, initLlmWorker } = require('./llm.worker');
const { reminderQueue, initReminderWorker } = require('./reminder.worker');

// Initialize all workers centrally
function initQueueWorker(io) {
    logger.info('Initializing background queue workers...');
    
    // 1. Initialize the specific workers and pass 'io' down
    initLlmWorker(io);
    initReminderWorker(io);

    // 2. Schedule the repeating reminder check
    // BullMQ repeatable jobs survive restarts — the schedule is stored in Redis
    reminderQueue.add(
        'check-reminders',
        {},  // no payload needed — the worker queries the DB itself
        {
            repeat: { every: 5 * 60 * 1000 },  // every 5 minutes in ms
            removeOnComplete: true,
            removeOnFail: false
        }
    ).then(() => logger.info('Reminder check job scheduled (every 5 min)'))
     .catch(err => logger.error(`Failed to schedule reminder job: ${err.message}`));
}

// We still export llmQueue here so that other files (like routes/todos.js) 
// that import it from queue.service.js don't break.
module.exports = { llmQueue, initQueueWorker };