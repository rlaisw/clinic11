import json

data = {
    "app": {
        "description": "",
        "icon": "",
        "icon_background": "#FFEAD5",
        "icon_type": "emoji",
        "mode": "advanced-chat",
        "name": "Clinic RAG Chat",
        "use_icon_as_answer_icon": False
    },
    "dependencies": [],
    "kind": "app",
    "version": "0.7.0",
    "workflow": {
        "conversation_variables": [],
        "environment_variables": [],
        "features": {
            "file_upload": {"enabled": False, "image": {"enabled": False, "number_limits": 3, "transfer_methods": ["local_file", "remote_url"]}, "allowed_file_types": ["image"], "allowed_file_extensions": [".JPG", ".JPEG", ".PNG", ".GIF", ".WEBP", ".SVG"], "allowed_file_upload_methods": ["local_file", "remote_url"], "number_limits": 3, "fileUploadConfig": {"file_size_limit": 15, "batch_count_limit": 5, "image_file_size_limit": 10, "audio_file_size_limit": 50, "video_file_size_limit": 100, "workflow_file_upload_limit": 10, "image_file_batch_limit": 10, "file_upload_limit": 50, "single_chunk_attachment_limit": 10, "attachment_image_file_size_limit": 2}},
            "opening_statement": "",
            "retriever_resource": {"enabled": True},
            "sensitive_word_avoidance": {"enabled": False},
            "speech_to_text": {"enabled": False},
            "suggested_questions": ["Show me patients with headache", "What medications are prescribed?", "List recent sick leave certificates"],
            "suggested_questions_after_answer": {"enabled": True},
            "text_to_speech": {"enabled": False, "language": "", "voice": ""}
        },
        "graph": {
            "edges": [
                {"data": {"isInIteration": False, "isInLoop": False, "iteration_id": None, "loop_id": None, "sourceType": "start", "targetType": "http-request"}, "id": "start-to-http", "source": "start", "sourceHandle": "source", "target": "http_node", "targetHandle": "target", "type": "custom", "zIndex": 0},
                {"data": {"isInIteration": False, "isInLoop": False, "iteration_id": None, "loop_id": None, "sourceType": "http-request", "targetType": "llm"}, "id": "http-to-llm", "source": "http_node", "sourceHandle": "source", "target": "llm", "targetHandle": "target", "type": "custom", "zIndex": 0},
                {"data": {"isInIteration": False, "isInLoop": False, "iteration_id": None, "loop_id": None, "sourceType": "llm", "targetType": "answer"}, "id": "llm-to-answer", "source": "llm", "sourceHandle": "source", "target": "answer", "targetHandle": "target", "type": "custom", "zIndex": 0}
            ],
            "nodes": [
                {"data": {"desc": "", "selected": False, "title": "Start", "type": "start", "variables": []}, "height": 100, "id": "start", "position": {"x": 30, "y": 303}, "positionAbsolute": {"x": 30, "y": 303}, "selected": False, "sourcePosition": "right", "targetPosition": "left", "type": "custom", "width": 242, "zIndex": 0},
                {"data": {"desc": "", "title": "Clinic RAG Search", "type": "http-request", "method": "post", "url": "http://172.28.51.11:8001/query", "authorization": {"type": "no-auth"}, "headers": "Content-Type: application/json", "params": "", "body": {"type": "raw", "data": '{"query": "{{#sys.query#}}", "top_k": 5}'}, "timeout": {"connect": 10, "read": 30, "write": 30}, "retry_config": {"enabled": False, "max_retries": 1, "retry_interval": 1000, "exponential_backoff": {"enabled": False, "multiplier": 2, "max_interval": 10000}}}, "height": 100, "id": "http_node", "position": {"x": 350, "y": 303}, "positionAbsolute": {"x": 350, "y": 303}, "selected": False, "sourcePosition": "right", "targetPosition": "left", "type": "custom", "width": 242, "zIndex": 0},
                {"data": {"context": {"enabled": True, "variable_selector": ["http_node", "body"]}, "desc": "", "memory": {"query_prompt_template": "{{#sys.query#}}", "role_prefix": {"assistant": "", "user": ""}, "window": {"enabled": False, "size": 10}}, "model": {"completion_params": {"temperature": 0.3, "max_tokens": 1024}, "mode": "chat", "name": "gpt-4o", "provider": "openai"}, "prompt_template": [{"id": "sys-prompt", "role": "system", "text": "You are a medical clinic assistant. Answer using ONLY the clinic records.\n\nContext:\n{{#http_node.body#}}\n\nQuestion: {{#sys.query#}}\n\nIf no relevant records, say so."}, {"role": "user", "text": "{{#sys.query#}}"}], "selected": False, "title": "LLM", "type": "llm", "vision": {"enabled": False}}, "height": 148, "id": "llm", "position": {"x": 670, "y": 303}, "positionAbsolute": {"x": 670, "y": 303}, "selected": False, "sourcePosition": "right", "targetPosition": "left", "type": "custom", "width": 242, "zIndex": 0},
                {"data": {"answer": "{{#llm.text#}}", "desc": "", "selected": False, "title": "Answer", "type": "answer", "variables": []}, "height": 146, "id": "answer", "position": {"x": 990, "y": 303}, "positionAbsolute": {"x": 990, "y": 303}, "selected": False, "sourcePosition": "right", "targetPosition": "left", "type": "custom", "width": 242, "zIndex": 0}
            ],
            "viewport": {"x": 0, "y": 0, "zoom": 0.7}
        },
        "rag_pipeline_variables": []
    }
}

with open(r"C:\kilocode\clinic11\rag\dify_workflow.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
print("Written dify_workflow.json - try importing this")