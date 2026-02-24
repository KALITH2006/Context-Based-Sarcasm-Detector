# Sarcasm Detector — Complete Guide

This document explains everything about how the project works, why we chose these specific technologies over others, how to run it, and how to share it.

---

## 🚀 1. How to Run the Program

To run this project on your computer, you need two terminals open because it has two separate parts: the **Backend (Python)** and the **Frontend (Node.js/React)**.

### Terminal 1: Start the Backend (The Brain)
Open a terminal, go to the project folder, and run:
```bash
# Optional: Ensure your virtual environment is activated
# .venv\Scripts\Activate.ps1

cd "e:\sarcasm detector"
python -m uvicorn backend.main:app --port 8000
```
This starts the Python API server on port 8000. It waits for texts to analyze.

### Terminal 2: Start the Frontend (The Face)
Open a *second* terminal, go to the project folder, and run:
```bash
cd "e:\sarcasm detector\frontend"
npm run dev
```
This starts the website UI on port 3000.
**To view the app:** Open your web browser and go to `http://localhost:3000`.

---

## 🏗️ 2. "What is What" (Project Architecture)

The project is split into distinct functional areas:

*   **`frontend/`**: The visual website (UI). This is what the user clicks on and sees. Built with React/Next.js. It takes user input, sends it to the backend over the internet (via HTTP), and draws the beautiful result cards.
*   **`backend/`**: The engine room. Built with Python/FastAPI. It receives the text from the frontend, runs it through the AI/Heuristic rules, calculates confidence numbers and highlighted words, and returns the JSON data.
*   **`model/`**: contains `train.py` and `evaluate.py`. These scripts are specifically for taking a massive dataset of sarcastic tweets and mathematically "teaching" an AI model (BERT) what sarcasm looks like.
*   **`docker/`**: Contains the `Dockerfile`. This is the blueprint for packaging up the entire application into a single container so it can run on any server in the world perfectly.

---

## 🤔 3. Why These Frameworks? (Technology Choices)

Here is exactly why we picked these tools instead of the alternatives:

### Why Next.js & React (Frontend) instead of plain HTML/JS or Angular/Vue?
*   **React** allows us to build complex, animated, modular UI components (like the Result Card, the interactive forms, and the history list).
*   **Next.js** handles all the hard setup (routing, combining TypeScript, compiling CSS) automatically out of the box so we can just focus on building the UI. It also allows for super quick builds compared to older tools like Create React App.
*   *Why not Vue or Angular?* React has the largest ecosystem, the best UI animation libraries (Framer Motion), and Next.js is the absolute industry standard for modern web apps right now.

### Why Tailwind CSS instead of Bootstrap or plain CSS?
*   **Tailwind** lets us style elements directly inside the HTML `className` strings rather than jumping back and forth to separate `.css` files. It allows for incredibly fast creation of beautiful shadows, gradients, and dark/light modes.
*   *Why not Bootstrap?* Bootstrap components often look generic and outdated. Tailwind gave us the ability to build a highly custom, modern, premium "Glassmorphism" design.

### Why FastAPI (Python) instead of Django, Flask, or Node.js (Express)?
*   **FastAPI** is incredibly fast, modern, and built specifically for creating APIs.
*   Since AI/Machine Learning models (like BERT/PyTorch) exclusively run in **Python**, our backend *has* to be in Python. We couldn't use Node.js for the backend.
*   *Why not Flask or Django?* Django is too bulky and designed for heavy database websites, not thin AI APIs. Flask is older and slower. FastAPI automatically generates API documentation (`/docs`) and validates data instantly.

### Why BERT (HuggingFace Transformers) instead of ChatGPT/OpenAI API?
*   If we used OpenAI (ChatGPT), we would have to pay money for every single sentence analyzed, and we would rely on a massive external internet connection.
*   **BERT** is an open-source model designed specifically for *text classification* tasks. By fine-tuning BERT ourselves on a sarcasm dataset, we own the model. It runs locally on your machine for free, doesn't need external internet APIs, and gives us exact mathematical internal weights (Attention) to show *why* it made its decision.

---

## 📦 4. How to Share This Project

You can share this project in three different ways depending on what your friend wants to do with it:

### Option A: Simply Send the Code (The ZIP File approach)
If you want to just give them the code so they can run it:
1.  **Crucial Step:** You must **NOT** ZIP the folders named `.venv` (Python libraries), `/backend/__pycache__`, or `frontend/node_modules` (Javascript libraries), or `/frontend/.next` (Build caches). These folders are gigantic (Gigabytes of data) and are tied to your specific computer.
2.  Zip the remaining source code.
3.  Send the ZIP file.
4.  When your friend extracts it, they manually run `npm install` inside the `frontend` folder and `pip install -r requirements.txt` for the backend to generate the libraries on their own machine.

### Option B: The "Pro" Way (GitHub)
Notice that you just ran `git add .`, `git commit -m "first commit"`, and `git push`? That means you successfully put the code on GitHub!
1.  Go to your GitHub repository page (e.g., `github.com/your-username/sarcasm-detector`).
2.  Ensure the repository is perfectly synced.
3.  Just send your friend the URL link!
4.  They can click "**Code** -> **Download ZIP**" or run `git clone <URL>` in their terminal. This automatically ignores the heavy `node_modules` folders because we set up a `.gitignore` file.

### Option C: The Execution Way (Docker)
If your friend just wants to *use* the app and doesn't want to install Python, Node, or worry about versions:
1.  Tell them to install **Docker Desktop** on their PC.
2.  Send them your GitHub link.
3.  Tell them to open a terminal in the project folder and run:
    ```bash
    docker build -t sarcasm-app -f docker/Dockerfile .
    docker run -p 3000:3000 sarcasm-app
    ```
    This single command downloads an isolated mini-computer, installs everything internally, and instantly hosts your beautiful app on `localhost:3000` on their computer without them ever seeing an error.

---

## 🌐 5. Deployment Workflow & Troubleshooting

Here is the exact step-by-step workflow we used to deploy the application to the internet, including the issues we ran into and how we solved them.

### Step 1: Push Code to GitHub
We initialized a Git repository, committed all files, and pushed to GitHub.
*   **Mistake:** The `frontend` folder was accidentally acting as a "Git Submodule" because Next.js creates a hidden `.git` folder inside it during initialization. This caused Vercel to not be able to see the frontend code.
*   **Fix:** We deleted the hidden `frontend/.git` folder, removed the submodule reference from the main repo using `git rm --cached frontend`, and re-added the folder as normal code.

### Step 2: Deploy Backend to Render
We connected our GitHub repository to Render as a "Web Service" to host the Python API.
*   **Mistake 1:** Render tried to install the absolute newest pre-release version of Python (3.14.3). Because this version is experimental, the massive `pandas` and `scikit-learn` libraries couldn't compile correctly, resulting in an "Out of Memory / subprocess-exited-with-error" crash.
*   **Fix 1:** We went into Render's Environment Variables and added `PYTHON_VERSION=3.11.8` to force Render to use a stable, standard Python version, which fixed the compiling crash instantly.
*   **Mistake 2:** Our `requirements.txt` asked for the latest version of `pytest` (8.0.0), but the testing library `pytest-asyncio` strictly required an older version (`<8.0.0`), causing a dependency conflict during `pip install`.
*   **Fix 2:** We downgraded `pytest==7.4.4` in our `requirements.txt` and pushed the fix to GitHub. Render automatically rebuilt and succeeded!

### Step 3: Deploy Frontend to Vercel
We connected our GitHub repository to Vercel.
*   **Setup:** We set the Root Directory to `frontend`.
*   **Connection:** We grabbed the live API URL from Render (e.g., `https://context-based-sarcasm....onrender.com`) and added it to Vercel as an Environment Variable named `NEXT_PUBLIC_API_URL`.
*   **Mistake:** We got a "Failed to fetch" error on the live Vercel site. This was a CORS (Cross-Origin Resource Sharing) block. The backend FastAPI server was strictly configured to only accept requests from `http://localhost:3000`, blocking the new `vercel.app` domain.
*   **Fix:** We updated `backend/main.py`'s `CORSMiddleware` to `allow_origins=["*"]` (allowing all domains) and pushed to GitHub. Render rebuilt the backend, and the frontend could successfully talk to it!
*   **Result:** Vercel automatically built and deployed the Next.js frontend. Now, when a user clicks the "Detect Sarcasm" button on the Vercel internet site, the frontend securely requests the AI analysis from the Render backend, providing a seamless full-stack deployment!
