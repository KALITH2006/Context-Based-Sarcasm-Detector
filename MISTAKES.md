# Mistakes & Lessons Learned — Sarcasm Detector Project

## 1. PowerShell `&&` syntax error
- **What happened:** README instructions used `cd frontend && npm run dev` which is Bash syntax. PowerShell does not support `&&` as a command separator.
- **Fix:** Changed all instructions to use separate lines or `;` as the PowerShell separator.
- **Lesson:** Always write shell commands targeting the user's OS. On Windows/PowerShell, use `;` or separate lines instead of `&&`.

## 2. `uvicorn` not on PATH
- **What happened:** Running `uvicorn backend.main:app` failed because `uvicorn` was not found as a standalone command.
- **Fix:** Use `python -m uvicorn backend.main:app` instead.
- **Lesson:** Always use `python -m <module>` on Windows to avoid PATH issues with pip-installed CLI tools.

## 3. No virtual environment created initially
- **What happened:** Dependencies were installed globally instead of in an isolated venv.
- **Fix:** Created `venv` folder with `python -m venv venv` and updated README with activation instructions.
- **Lesson:** Always create a venv as the first step in any Python project setup.

## 4. Frontend dev server exiting prematurely
- **What happened:** The `npm run dev` background process exited with code 1 during browser verification, causing `ERR_CONNECTION_REFUSED`.
- **Fix:** Restarted with `npx next dev --port 3000` which stayed alive.
- **Lesson:** When running dev servers in background via tooling, verify they remain alive before browser tests.

## 5. `npm run dev -- -p 3000` argument error
- **What happened:** Next.js 16 interpreted `-p 3000` as a project directory path instead of a port flag.
- **Fix:** Used `npx next dev --port 3000` directly.
- **Lesson:** Check CLI help for version-specific argument syntax before assuming flags.

## 6. `pip install` PowerShell stderr redirect
- **What happened:** `pip install ... 2>&1 | Select-Object -Last 5` caused a pip error due to how PowerShell handles stderr piping.
- **Fix:** Ran `pip install` without output redirection.
- **Lesson:** Avoid complex shell piping for pip installs; let output flow naturally.

## 7. README `pytest` command
- **What happened:** Used `pytest backend/tests/ -v` directly, which may fail if pytest isn't on PATH.
- **Fix:** Changed to `python -m pytest backend/tests/ -v`.
- **Lesson:** Same as #2 — always use `python -m` prefix on Windows.
