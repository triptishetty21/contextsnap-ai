import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict

app = FastAPI(title="ContextSnap AI Engine")

# Enable CORS for seamless React communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PathPayload(BaseModel):
    directory_path: str

# Protected system paths to ignore
IGNORED_DIRS = {
    "node_modules", ".git", "venv", "__pycache__", 
    ".cache", "build", "dist", ".next"
}

@app.get("/api/health")
def health_check():
    return {"status": "active", "service": "ContextSnap Core"}

@app.post("/api/v1/scan")
async def scan_directory(payload: PathPayload):
    target_path = payload.directory_path
    
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="Directory path not found on local machine.")
    if not os.path.isdir(target_path):
        raise HTTPException(status_code=400, detail="Provided path is a file, not a directory.")

    structure: List[Dict] = []
    total_characters = 0

    for root, dirs, files in os.walk(target_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        for file in files:
            file_path = os.path.join(root, file)
            relative_path = os.path.relpath(file_path, target_path)
            
            try:
                with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                    content = f.read()
                    char_count = len(content)
                    total_characters += char_count
                    
                    structure.append({
                        "path": relative_path,
                        "size_chars": char_count,
                        "extension": os.path.splitext(file)[1]
                    })
            except Exception:
                continue

    estimated_tokens = int(total_characters / 4)
    return {
        "root": os.path.basename(target_path),
        "total_files": len(structure),
        "estimated_tokens": estimated_tokens,
        "files": structure
    }

@app.post("/api/v1/generate-blueprint")
async def generate_blueprint(payload: PathPayload):
    target_path = payload.directory_path
    
    if not os.path.exists(target_path):
        raise HTTPException(status_code=404, detail="Directory path not found.")

    file_contents = {}
    detected_frameworks = []

    # Read active codebase text content
    for root, dirs, files in os.walk(target_path):
        dirs[:] = [d for d in dirs if d not in IGNORED_DIRS]
        for file in files:
            if file.endswith(('.py', '.js', '.jsx', '.ts', '.tsx', '.json', '.html', '.css')):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, target_path)
                try:
                    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                        code = f.read()
                        file_contents[rel_path] = code
                        # Detect core stack indicators
                        if "fastapi" in code.lower(): detected_frameworks.append("FastAPI (Python Backend)")
                        if "react" in code.lower(): detected_frameworks.append("React (Frontend SPA)")
                        if "express" in code.lower(): detected_frameworks.append("Express.js Server")
                        if "tailwindcss" in code.lower() or "@import \"tailwindcss\"" in code: 
                            detected_frameworks.append("Tailwind CSS v4")
                except Exception:
                    continue

    # De-duplicate framework tags
    detected_frameworks = list(set(detected_frameworks)) if detected_frameworks else ["Generic Clean Architecture Project"]

    # --- SIMULATION FALLBACK ENGINE ---
    # Dynamically build a real Mermaid.js diagram based on actual parsed files
    mermaid_nodes = []
    mermaid_edges = []
    
    for idx, path in enumerate(file_contents.keys()):
        clean_node_id = f"node_{idx}"
        filename = os.path.basename(path)
        mermaid_nodes.append(f'    {clean_node_id}["📄 {filename}<br/><small>{path}</small>"]')
        
        # Smart dynamic linking: connect components logically
        if "main.py" in filename and any("App" in k or "index" in k for k in file_contents.keys()):
            for f_idx, f_path in enumerate(file_contents.keys()):
                if "App" in f_path or "index" in f_path:
                    mermaid_edges.append(f'    node_{f_idx} --"REST API Requests"--> {clean_node_id}')

    # Assemble structural diagram syntax
    nodes_str = "\n".join(mermaid_nodes)
    edges_str = "\n".join(mermaid_edges)
    
    if not edges_str:
        # Fallback to structural tree visualization if no direct API routes are inferred
        edges_str = "    node_0 --> node_1" if len(mermaid_nodes) > 1 else ""

    generated_mermaid = f"graph TD\n{nodes_str}\n{edges_str}"

    system_summary = (
        f"This system represents a high-efficiency layout built primarily leveraging "
        f"{', '.join(detected_frameworks)}. The architecture utilizes decoupled file handling boundaries "
        f"to manage application lifecycle states and state serialization."
    )

    return {
        "summary": system_summary,
        "mermaid_chart": generated_mermaid,
        "frameworks": detected_frameworks
    }