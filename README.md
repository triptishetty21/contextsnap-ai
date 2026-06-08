# ContextSnap AI Cloud ⚡

ContextSnap AI is a high-efficiency, minimalist full-stack internal developer tool designed to securely ingest code repositories in-memory and instantly map out an architectural blueprint alongside token metrics for context window calculations. 

Built with an offline **Simulation Fallback Engine**, it completely bypasses cloud API runtime configurations, making it 100% stable, fast, and zero-cost to open and use on any device.

---

## 🏗️ System Architecture & Data Flow

Unlike traditional code parsers that require local terminal configurations, ContextSnap AI operates entirely via a decoupled cloud-stream model:

1. **Frontend Boundary (React + Vite + Tailwind CSS v4):** The browser uses HTML5 relative path streams to filter out heavy binary artifacts (`node_modules`, `.git`, `.venv`) immediately at the user entry line to prevent memory overhead.
2. **Backend Engine (FastAPI + Async HTTP Core):** Core source files are sent as multi-part form binaries into temporary machine memory. The backend safely decodes strings, runs framework signature matches, and structures a real-time system mapping.
3. **Visualization Layer (Mermaid.js Matrix):** The backend outputs structured graph layouts that render into high-contrast flowcharts seamlessly on the user console dashboard.

---

## 🛠️ The Tech Stack

* **Frontend Dashboard:** React, Vite, Tailwind CSS v4 (Modern Minimalist Dark Theme)
* **Backend Processing Engine:** Python, FastAPI, Uvicorn (Asynchronous In-Memory Stream Parsing)
* **Binary Processing:** Python-Multipart, Standard Webkit Directory Selectors

---

## 🚀 Local Installation & Workspace Spin-Up

If you wish to run the workspace entirely on your local machine for active development, execute these steps:

### 1. Initialize the Backend Service
```bash
cd backend
python -m venv venv
./venv/Scripts/activate  # On Windows (Standard Command Prompt)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
