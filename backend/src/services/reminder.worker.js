const { Queue, Worker } = require("bullmq");
const Todo = require("../models/Todo");
const logger = require("../utils/logger");

const redisOptions = {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
};

// The queue — used to schedule the repeating reminder check job
const reminderQueue = new Queue('reminder-queue', redisOptions);

// Called from server.js AFTER io is created, so we can pass io in
function initReminderWorker(io) {
    const worker = new Worker('reminder-queue', async (job) => {
        logger.info(`Running reminder check job ${job.id}`);

        const now = new Date();
        const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const in1h  = new Date(now.getTime() + 60 * 60 * 1000);

        // --- 24h reminders ---
        const due24h = await Todo.find({
            dueDate: { $gt: now, $lte: in24h },  // due within the next 24h window
            completed: false,
            remindersEnabled: true,
            remindersSent: { $nin: ['24h'] }       // not already sent
        });

        for (const todo of due24h) {
            // Emit to the specific user's room (userId as room name)
            io.to(todo.userId.toString()).emit('reminder', { todo, type: '24h' });
            await Todo.findByIdAndUpdate(todo._id, { $addToSet: { remindersSent: '24h' } });
            logger.info(`Sent 24h reminder for todo ${todo._id} to user ${todo.userId}`);
        }

        // --- 1h reminders ---
        const due1h = await Todo.find({
            dueDate: { $gt: now, $lte: in1h },
            completed: false,
            remindersEnabled: true,
            remindersSent: { $nin: ['1h'] }
        });

        for (const todo of due1h) {
            io.to(todo.userId.toString()).emit('reminder', { todo, type: '1h' });
            await Todo.findByIdAndUpdate(todo._id, { $addToSet: { remindersSent: '1h' } });
            logger.info(`Sent 1h reminder for todo ${todo._id} to user ${todo.userId}`);
        }

    }, redisOptions);

    worker.on('failed', (job, err) => {
        logger.warn(`Reminder job ${job.id} failed: ${err.message}`);
    });

    logger.info('Reminder worker initialized');
}

module.exports = { reminderQueue, initReminderWorker };