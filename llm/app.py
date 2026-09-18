# pyrefly: ignore [missing-import]
from httpx import _status_codes
import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv 
# pyrefly: ignore [missing-import]
import httpx
# pyrefly: ignore [missing-import]
from fastapi import FastAPI, HTTPException, APIRouter

# pyrefly: ignore [missing-import]
from pydantic import BaseModel
load_dotenv()
app = FastAPI(title="AI Todo List", version="1.0.0")

router = APIRouter(prefix="/api/ai")

LLM_MODEL = os.getenv("LLM_MODEL")
OLLAMA_HOST = os.getenv("OLLAMA_HOST")

class TodoRequest(BaseModel):
    title: str

class PlanRequest(BaseModel):
    title: str
    desc: str

class PrioritizeRequest(BaseModel):
    todos: list[dict]

@router.get("/health")
def health_check():
    return {"status":"ok", "model":LLM_MODEL}


@router.post("/generate")
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

@router.post("/plan")
async def generate_plan(plan: PlanRequest):
    prompt = f"Break down the following task into 3-5 small, actionable sub-tasks. Return ONLY a numbered list of steps without any introductory text.\nTask: {plan.title}\nDescription: {plan.desc}"
    
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
            return {"plan": data.get("response ", "").strip()}

    except httpx.HTTPError as e:
        print(f"Error calling LLM provider: {e}")
        raise HTTPException(status_code=500, detail="Failed to connect to LLM Model service")

@router.post("/prioritize")
async def prioritize_todos(req: PrioritizeRequest):
    import json
    items = "\n".join([
        f"- ID:{t.get('_id', t.get('id'))} | Text:{t['text']} | Due:{t.get('dueDate','none')} | Current:{t.get('priority', 'none')}"
        for t in req.todos
    ])
    prompt = f"""You are a productivity assistant. For each todo below, suggest the best priority level (high/medium/low) and give a one-sentence reason.
Return ONLY a valid JSON array: [{{"id":"...","priority":"high|medium|low","reason":"..."}}]
Todos:
{items}"""
    try:
        async with httpx.AsyncClient(timeout=None) as client:
            response = await client.post(
                f"{OLLAMA_HOST}/api/generate",
                json={
                    "model": LLM_MODEL,
                    "prompt": prompt,
                    "stream": False,
                    "format": "json"
                }
            )
            response.raise_for_status()
            data = response.json()
            resp_text = data.get("response", "").strip()
            if not resp_text:
                return {"suggestions": []}
            
            # Remove markdown code blocks if present
            if resp_text.startswith("```json"):
                resp_text = resp_text[7:]
            elif resp_text.startswith("```"):
                resp_text = resp_text[3:]
            if resp_text.endswith("```"):
                resp_text = resp_text[:-3]
            resp_text = resp_text.strip()

            try:
                suggestions = json.loads(resp_text)
            except json.JSONDecodeError:
                # Fallback: extract array using regex
                import re
                match = re.search(r'\[.*\]', resp_text, re.DOTALL)
                if match:
                    try:
                        suggestions = json.loads(match.group(0))
                    except:
                        suggestions = []
                else:
                    suggestions = []
                    
            return {"suggestions": suggestions}
    except Exception as e:
        print(f"Error calling LLM provider: {e}")
        raise HTTPException(status_code=500, detail="Failed to prioritize")

app.include_router(router)