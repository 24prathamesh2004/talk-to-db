from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, text
from huggingface_hub import InferenceClient
from dotenv import load_dotenv
import os

load_dotenv()
token = os.getenv("TOKEN")

HF_API_KEY = token  # Replace with your Hugging Face API key
MODEL_ID = "deepseek-ai/DeepSeek-V3-0324"  # Example LLM; choose one suitable for chat/completions

print(HF_API_KEY ,"key")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_dynamic_engine(conn):
    try:
        db_url = (
            f"mysql+pymysql://{conn['user']}:{conn['password']}"
            f"@{conn['host']}:{conn['port']}/{conn['database']}"
        )
        return create_engine(
            db_url,
            pool_recycle=3600,
            pool_pre_ping=True
        )
    except Exception as e:
        raise ValueError(f"Invalid connection: {e}")

# Helper to call Hugging Face chat completion
def hf_chat_completion(messages):
    client = InferenceClient(api_key=HF_API_KEY)
    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=messages,
        max_tokens=256,
        temperature=0.2,
    )
    return response.choices[0].message.content.strip()

@app.post("/query")
async def query_db(request: Request):
    body = await request.json()
    prompt = body.get("prompt", "")
    conn_info = body.get("connection", {})

    if not prompt or not conn_info:
        return {"error": "Prompt or DB connection details missing."}

    try:
        engine = create_dynamic_engine(conn_info)

        # 1. Extract table names
        table_extract_messages = [
            {"role": "system", "content": "Extract table names used in the prompt. Comma-separated, no explanation."},
            {"role": "user", "content": prompt}
        ]
        table_names_str = hf_chat_completion(table_extract_messages)
        tables = [t.strip() for t in table_names_str.split(",")]

        # 2. Get schema from MySQL
        schema_parts = []
        with engine.begin() as conn:
            for table in tables:
                try:
                    rows = conn.execute(text(f"DESCRIBE {table}")).fetchall()
                    columns = [f"{row[0]} {row[1]}" for row in rows]
                    schema_parts.append(f"{table}({', '.join(columns)})")
                except Exception as e:
                    return {"error": f"Schema error for '{table}': {e}"}
        schema = "\n".join(schema_parts)

        # 3. Generate SQL using schema
        system_prompt = f"""You are a MySQL expert.
Use the schema below to write a valid SQL query for the user's prompt.

{schema}

Return only the SQL query, nothing else.
"""
        sql_gen_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": prompt}
        ]
        sql = hf_chat_completion(sql_gen_messages)

        # Clean SQL if wrapped in markdown
        if sql.startswith("```") and sql.endswith("```"):
            sql = sql.strip("```").strip()
            if sql.lower().startswith("sql"):
                sql = "\n".join(sql.split("\n")[1:]).strip()

        # 4. Execute the SQL query
        with engine.begin() as conn:
            result = conn.execute(text(sql))
            if sql.lower().startswith("select"):
                rows = [dict(row._mapping) for row in result]
                return {"sql": sql, "data": rows}
            else:
                return {"sql": sql, "message": f"{result.rowcount} rows affected."}

    except Exception as e:
        return {"error": f"Server error: {e}"}

@app.get("/")
async def root():
    return {"message": "Backend is running!"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)





