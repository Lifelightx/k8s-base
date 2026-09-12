const { Queue, Worker } = require('bullmq')
const { GenerateDesc, generateDesc } = require('./llm.service')
const Todo = require('../models/Todo')
const logger = require('../utils/logger')


const redisOptions = {
    //BullMQ expects a Redis connection object

    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
}

//create the queue
const llmQueue = new Queue('llm-description-queue', redisOptions)

//Create the worker that processes jobs from the queue
function initQueueWorker(io) {
    const worker = new Worker('llm-description-queue', async (job) => {
        logger.info(`processing job ${job.id} for Todo ${job.data.todoId}`)
        try {
            const description = await generateDesc(job.data.text)
            if (description) {
                const updatedTodo = await Todo.findByIdAndUpdate(job.data.todoId, { description }, {new: true});
                logger.info(`Sucessfully generated description for Todo ${job.data.todoId}`)
                io.emit('todoUpdated', updatedTodo)
            }
        } catch (error) {
            logger.error(`Failed to generate description for todo ${job.data.todoId}: ${error.message}`)
            //Throwing an error tells BullMQ the job failed so it will automatically retry it Later
            throw error;
        }
    }, redisOptions);

    worker.on('failed', (job, err) => {
        logger.warn(`Job ${job.id} failed with error ${err.message}`)
    })

}

module.exports = { llmQueue, initQueueWorker }