const { Queue, Worker } = require('bullmq');
const { generateDesc } = require('./llm.service');
const Todo = require('../models/Todo');
const logger = require('../utils/logger');

const redisOptions = {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
};

// Create the queue
const llmQueue = new Queue('llm-description-queue', redisOptions);

// Create the worker that processes jobs from the queue
function initLlmWorker(io) {
    const worker = new Worker('llm-description-queue', async (job) => {
        logger.info(`Processing job ${job.id} for Todo ${job.data.todoId}`);
        try {
            const description = await generateDesc(job.data.text);
            if (description) {
                const updatedTodo = await Todo.findByIdAndUpdate(job.data.todoId, { description }, { new: true });
                logger.info(`Successfully generated description for Todo ${job.data.todoId}`);
                io.emit('todoUpdated', updatedTodo);
            }
        } catch (error) {
            logger.error(`Failed to generate description for todo ${job.data.todoId}: ${error.message}`);
            // Throwing an error tells BullMQ the job failed so it will automatically retry it later
            throw error;
        }
    }, redisOptions);

    worker.on('failed', (job, err) => {
        logger.warn(`Job ${job.id} failed with error: ${err.message}`);
    });

    logger.info('LLM worker initialized');
}

module.exports = { llmQueue, initLlmWorker };

