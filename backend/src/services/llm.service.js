const LLM_SERVICE_URL = process.env.LLM_SERVICE_URL || "http://localhost:5001";
const axios = require("axios")

async function generateDesc(topic) {

    const llmRs = await axios.post(`${LLM_SERVICE_URL}/generate`,
        { title: topic },
        { timeout: 10000 }
    )
    if (llmRs.status !== 200) {
        logger.error(`Failed to fetch details from LLM service: status=${llmRs.status}`)
        res.status(500).json({ message: "Failed to fetch details from LLM service" })
        return;
    }

    return llmRs.data.description || ""
}

module.exports = { generateDesc }