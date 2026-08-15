from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))
from rag_engine import search_clinic, index_clinic_data

app = FastAPI(title="Clinic RAG API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QueryRequest(BaseModel):
    query: str
    top_k: int = 5


class QueryResponse(BaseModel):
    results: list[dict]
    total: int


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/query", response_model=QueryResponse)
def query_rag(req: QueryRequest):
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    results = search_clinic(req.query, req.top_k)
    return QueryResponse(results=results, total=len(results))


@app.post("/reindex")
def reindex():
    try:
        count = index_clinic_data()
        return {"status": "ok", "records_indexed": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    print("Starting Clinic RAG API on http://0.0.0.0:8001")
    uvicorn.run(app, host="0.0.0.0", port=8001)