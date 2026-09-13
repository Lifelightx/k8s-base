const request = require('supertest')
const express = require('express')


const todoRoutes = require('./todos')
const Todo = require('../models/Todo')

jest.mock('../models/Todo')

jest.mock('../services/queue.service', ()=> ({
    llmQueue: {
        add: jest.fn().mockResolvedValue()
    }
}))

jest.mock('../middleware/protect', ()=> (req, res, next)=>{
    req.user = {id: 'fakeUserId'};
    next();
})

const app = express();
app.use(express.json())

app.use('/api/todos', require('../middleware/protect'), todoRoutes);

describe('Todo Routes', ()=>{

    beforeEach(() => {
        jest.clearAllMocks();
    })

    describe('GET /api/todos', ()=>{
    it('Should return a list of todos', async ()=>{
        const fakeTodos = [
            {_id: '1', text:'Buy car', priority: 'high', description:'test', completed: false, userId: 'fakeUserId'},
            {_id: '2', text: 'Learn Testing', priority:'medium', description:'test', completed: true, userId: 'fakeUserId'}

        ];
        Todo.find.mockReturnValue({
            sort: jest.fn().mockResolvedValue(fakeTodos)
        })
        const response = await request(app).get('/api/todos');
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(fakeTodos)

        expect(Todo.find).toHaveBeenCalledWith({userId: 'fakeUserId'})
    })

})
})