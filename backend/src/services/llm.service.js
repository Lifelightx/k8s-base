const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || "http://localhost:5001";
const axios = require("axios")

async function generateDesc(topic) {

    try{
        const llmRs = await axios.post(`${LLM_SERVICE_URL}/api/ai/generate`,
            { title: topic },
            { timeout: 10000 }
        )
        if (llmRs.status !== 200) {
            throw new Error(`Invalid status code: ${llmRs.status}`)
        }

        return llmRs.data.description || ""
    }catch(err){
        throw new Error('Failed to fetch details from LLM service')
    }
}

module.exports = { generateDesc }