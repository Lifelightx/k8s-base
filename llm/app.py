# pyrefly: ignore [missing-import]
from httpx import _status_codes
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv 
# pyrefly: ignore [missing-import]
import httpx
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException

# pyrefly: ignore [missing-import]
from pydantic import BaseModel
load_dotenv()
app = FastAPI(title="AI Todo List", version="1.0.0")

LLM_MODEL = os.getenv("LLM_MODEL")
OLLAMA_HOST = os.getenv("OLLAMA_HOST")

class TodoRequest(BaseModel):
    title: str


@app.get("/health")
def health_check():
    return {"status":"ok", "model":LLM_MODEL}


@app.post("/generate")
async def generate_description(todo: TodoRequest):
    prompt = f"Generate a concise, 2-sentence actionable description for the todo task: {todo.title}, Respond with only the description in string format and dont add quotes. "
    print(OLLAMA_HOST)
    try:
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": LLM_MODEL,
                    "prompt": prompt,
                    "stream": False

                }
            )
            response.raise_for_status()

            data = response.json()

            return {"description": data.get("response", "").strip()}

    except httpx.HTTPError as e:
        print(f"Error calling LLM provider: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to LLM Model service")

