# Configure Dify to Use Clinic RAG API

## Step 1: Create a Custom Tool in Dify

1. **Login** to your Dify instance at `https://dify.clinic.com.hk`
2. Navigate to **Tools** → **Custom Tools** → **Create Custom Tool**
3. Fill in the details:

   | Field | Value |
   |-------|-------|
   | Name | `Clinic RAG Query` |
   | Description | `Search clinic database using RAG` |
   | API Endpoint | `http://172.28.51.11:8001` (Windows client IP) |
   | Method | `POST` |
   | Path | `/query` |
   | Headers | `Content-Type: application/json` |

4. **Request Body Schema** (JSON):
   ```json
   {
     "type": "object",
     "required": ["query"],
     "properties": {
       "query": {
         "type": "string",
         "description": "The medical question to search for"
       },
       "top_k": {
         "type": "integer",
         "description": "Number of results to return (default 5)"
       }
     }
   }
   ```

5. **Response Schema** (JSON):
   ```json
   {
     "type": "object",
     "properties": {
       "results": {
         "type": "array",
         "items": {
           "type": "object",
           "properties": {
             "text": { "type": "string" },
             "source_type": { "type": "string" },
             "_distance": { "type": "number" }
           }
         }
       },
       "total": { "type": "integer" }
     }
   }
   ```

## Step 2: Create a Dify Workflow

1. Go to **Studio** → **Create Workflow**
2. Add nodes:
   - **Start Node**: Input variable `question` (string)
   - **HTTP Request Node**: Call Clinic RAG API
     ```
     URL: http://172.28.51.11:8001/query
     Method: POST
     Body: {"query": "{{question}}", "top_k": 5}
     ```
   - **LLM Node**: Generate answer from RAG results
     ```
     System: You are a medical assistant. Answer based on the clinic data provided.
     Context: {{http_response.results}}
     Question: {{question}}
     ```
   - **End Node**: Return the LLM answer

3. **Save and Publish** the workflow

## Step 3: Create a Chat Application

1. Go to **Applications** → **Create Application** → **Chat App**
2. Select the workflow created above
3. Configure the app:
   - Name: `Clinic RAG Chat`
   - Description: `Ask questions about clinic data`
4. **Publish** the app

## Step 4: Verify

1. Open your chatbot URL: `https://dify.clinic.com.hk/chat/u3gp6aJ0gKWnEFDr`
2. Ask: "What patients are in the system?"
3. The RAG system will:
   - Search LanceDB for matching clinic records
   - Return relevant results
   - Dify LLM generates a natural language answer

## Troubleshooting

- **Connection refused**: Ensure RAG API is running on port 8001
- **No results**: Run `python rag/test_search.py "your query"` to verify indexing
- **Wrong IP**: The Dify server connects to `172.28.51.11:8001` (Windows client IP)