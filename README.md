# 🧠 Talk-to-DB: Natural Language to SQL with FastAPI + React + LLM

Talk-to-DB is an intelligent full-stack application that allows users to query their database using **natural language**. Powered by **FastAPI**, **HuggingFace's LLM**, and a **React + Vite frontend**, it automatically converts human language into **accurate SQL queries**, executes them, and displays the result.

> 🚀 Say goodbye to manual SQL writing — just describe what you want, and the AI does the rest!

---

## 📸 Snapshot

![Talk to DB Demo](.//talk-to-db-snap.png)

> _*You can update this with your own screenshot inside the `assets/` folder and adjust the path accordingly._  

---

## 🧰 Tech Stack

| Layer        | Technology                        |
|--------------|------------------------------------|
| Frontend     | React + Vite + Tailwind (optional) |
| Backend      | FastAPI                            |
| AI Engine    | HuggingFace LLM (DeepSeek-V3-0324) |
| Database     | MySQL                              |
| Deployment   | Render (Backend) + Vercel (Frontend)|

---

## 🗂 Folder Structure
```
talk-to-db/
│
├── backend/
│ ├── app.py
│ ├── requirements.txt
│ ├── .env
│ └── venv/
│
└── frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
├── App.jsx
└── main.jsx

```
---

## ⚙️ Setup Instructions

### 🔧 Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # or use activate.bat in CMD

# Install dependencies
pip install -r requirements.txt

# Add your HuggingFace key in .env
TOKEN=hf_your_token_here

# Run server
uvicorn app:app --reload --host 127.0.0.1 --port 8000

🌐 Frontend
cd frontend

# Install packages
npm install

# Run Vite dev server
npm run dev

📦 API Usage
POST /query
{
  "prompt": "List all employees earning more than ₹80,000",
  "connection": {
    "user": "root",
    "password": "yourpass",
    "host": "localhost",
    "port": 3306,
    "database": "yourdbname"
  }
}
Response:
{
  "sql": "SELECT * FROM employees WHERE salary > 80000",
  "data": [ ... ]
}

✅ Features
🧠 Uses LLM (DeepSeek / HuggingFace) to generate accurate SQL

🔐 Supports dynamic DB connections

🖥️ Simple UI to ask questions

⚡ Executes and displays results instantly
