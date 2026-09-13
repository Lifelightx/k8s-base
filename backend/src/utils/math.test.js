const { add } = require('./math')

describe('Math utility Functions', ()=>{
    it('Should add two numbers correctly', ()=>{
        const num1 = 4;
        const num2 = 5;

        const result = add(num1, num2)
        expect(result).toBe(9)
    })
})