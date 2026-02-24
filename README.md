🧠 Context-Based Sarcasm Detector

> A full-stack AI web application that detects sarcasm in text using a fine-tuned **BERT** model with attention-based explainability.

![Tech](https://img.shields.io/badge/Frontend-Next.js-black)
![Tech](https://img.shields.io/badge/Backend-FastAPI-009688)
![Tech](https://img.shields.io/badge/Model-BERT-orange)
![Tech](https://img.shields.io/badge/ML-PyTorch-EE4C2C)

---

## 📌 Table of Contents

* [About The Project](#-about-the-project)
* [System Architecture](#-system-architecture)
* [Features](#-features)
* [Tech Stack](#-tech-stack)
* [Project Structure](#-project-structure)
* [Installation](#-installation)
* [Usage](#-usage)
* [Model Training](#-model-training)
* [API Endpoints](#-api-endpoints)
* [Environment Variables](#-environment-variables)
* [Docker](#-docker)
* [Deployment](#-deployment)
* [Testing](#-testing)

---

## 📖 About The Project

The **Context-Based Sarcasm Detector** is an explainable NLP system designed to:

* Detect sarcasm in short text
* Highlight attention-driving words
* Provide confidence scores
* Generate AI-based explanations
* Support batch predictions
* Offer model analytics via admin dashboard

It combines:

* 🌐 Modern Web UI (Next.js)
* 🔌 High-performance REST API (FastAPI)
* 🤖 Fine-tuned BERT Model (PyTorch)
* 🐳 Dockerized Deployment
* ⚡ CI/CD Automation

---

## 🏗 System Architecture

```text
User (Browser)
      ↓
Next.js Frontend (Port 3000)
      ↓
FastAPI Backend (Port 8000)
      ↓
BERT Model (PyTorch)
      ↓
Prediction + Attention Scores
      ↓
Highlighted Output + Explanation
```

---

## ✨ Features

### 🤖 AI & Explainability

* Fine-tuned BERT sarcasm classifier
* Attention-based word highlighting
* Confidence scoring
* Optional SHAP explanations
* Model evaluation metrics

### 🌐 Frontend

* Glassmorphism UI
* Framer Motion animations
* Dark / Light mode toggle
* Animated confidence bar
* Batch prediction support (up to 50 texts)
* Prediction history (localStorage)

### 📊 Admin Dashboard

* Confusion matrix
* Accuracy & F1 score
* Model statistics endpoint

### ⚙ DevOps

* Docker support
* GitHub Actions CI/CD
* Environment-based configuration

---

## 🛠 Tech Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Frontend | Next.js, Tailwind CSS, Framer Motion |
| Backend  | FastAPI, Uvicorn                     |
| Model    | BERT (HuggingFace Transformers)      |
| ML       | PyTorch, scikit-learn, SHAP          |
| Infra    | Docker, GitHub Actions               |

---

## 📂 Project Structure

```
sarcasm-detector/
│
├── frontend/                 # Next.js frontend
│   ├── src/
│   └── package.json
│
├── backend/                  # FastAPI backend
│   ├── api/
│   ├── services/
│   ├── tests/
│   ├── main.py
│   └── schemas.py
│
├── model/                    # Training & evaluation
│   ├── train.py
│   └── evaluate.py
│
├── docker/
│   └── Dockerfile
│
├── .github/workflows/
│   └── ci.yml
│
└── requirements.txt
```

---

## ⚙ Installation

### Prerequisites

* Python 3.10+
* Node.js 18+
* npm

---

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/sarcasm-detector.git
cd sarcasm-detector
```

---

### 2️⃣ Create Virtual Environment

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Linux/Mac:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

## ▶ Usage

### Start Backend

```powershell
python -m uvicorn backend.main:app --reload --port 8000
```

API:

```
http://localhost:8000
```

Swagger Docs:

```
http://localhost:8000/docs
```

---

### Start Frontend (Separate Terminal)

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

## 🧠 Model Training

### Train Model (GPU recommended)

```powershell
python -m model.train --epochs 4 --batch_size 16 --lr 2e-5
```

This:

* Downloads dataset
* Fine-tunes BERT
* Saves `model/sarcasm_model.pt`

### Evaluate Model

```powershell
python -m model.evaluate
```

---

## 🔗 API Endpoints

| Method | Endpoint             | Description       |
| ------ | -------------------- | ----------------- |
| POST   | `/api/predict`       | Single prediction |
| POST   | `/api/predict/batch` | Batch prediction  |
| GET    | `/api/stats`         | Model metrics     |
| GET    | `/api/health`        | Health check      |
| GET    | `/docs`              | Swagger UI        |
| GET    | `/redoc`             | ReDoc             |

---

### Example Request

```bash
curl -X POST http://localhost:8000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"text": "Oh great, another Monday morning!"}'
```

---

### Example Response

```json
{
  "prediction": "Sarcastic",
  "confidence": 0.91,
  "highlighted_words": ["great", "Oh"],
  "explanation": "The model is 91% confident this text is sarcastic...",
  "attention_scores": { "Oh": 0.34, "great": 0.28 }
}
```

---

## 🌍 Environment Variables

| Variable            | Default                                        | Description     |
| ------------------- | ---------------------------------------------- | --------------- |
| DEVICE              | cpu                                            | cpu or cuda     |
| CORS_ORIGINS        | [http://localhost:3000](http://localhost:3000) | Allowed origins |
| LOG_LEVEL           | INFO                                           | Logging level   |
| SHAP_ENABLED        | false                                          | Enable SHAP     |
| NEXT_PUBLIC_API_URL | [http://localhost:8000](http://localhost:8000) | Backend URL     |

---

## 🐳 Docker

### Build

```bash
docker build -f docker/Dockerfile -t sarcasm-detector .
```

### Run

```bash
docker run -p 8000:8000 sarcasm-detector
```

---

## 🚀 Deployment

### Frontend → Vercel

* Import `frontend/`
* Set `NEXT_PUBLIC_API_URL`
* Deploy

### Backend → Render

* Use Docker runtime
* Set environment variables
* Deploy

### Backend → AWS (ECS / EC2)

* Build & push Docker image to ECR
* Create ECS service
* Configure environment variables

---

## 🧪 Testing

### Backend

```powershell
python -m pytest backend/tests/ -v
```

### Frontend

```powershell
cd frontend
npm run lint
npm run build
```

---

