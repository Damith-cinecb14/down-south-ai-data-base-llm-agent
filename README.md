# Down South Service Command

A secure operations frontend for the Down South Region hospital-service database. The dashboard combines hospital, equipment, service-agreement, and natural-language database views behind server-enforced authentication.

## What is included

- Protected user login and signed, HTTP-only local sessions
- Sign in with ChatGPT support when hosted with OpenAI Sites
- Regional overview with live PostgreSQL record counts
- Hospital directory and equipment totals by facility
- Searchable equipment and service-agreement registers
- Read-only AI database assistant
- Authenticated server-side proxy routes, so the browser never receives database credentials or an OpenAI key
- Responsive desktop, tablet, and mobile layouts

## Prerequisites

- Node.js 22.13 or newer
- Python 3.12 or newer
- PostgreSQL with the `downsouthregion` database
- A valid `OPENAI_API_KEY` for AI assistant responses

## Configuration

Copy `.env.example` to `.env.local` and set strong local credentials:

```env
BACKEND_API_URL=http://127.0.0.1:8001
LOCAL_LOGIN_ENABLED=true
LOCAL_LOGIN_EMAIL=admin@example.com
LOCAL_LOGIN_PASSWORD=change-this-password
LOCAL_LOGIN_NAME=Service Administrator
SESSION_SECRET=replace-with-a-long-random-secret
```

Configure `backend/.env` without committing it:

```env
OPENAI_API_KEY=your-api-key
DATABASE_URL=postgresql+asyncpg://postgres:admin@localhost:5432/downsouthregion
AGENT_DATABASE_URL=postgresql://postgres:admin@localhost:5432/downsouthregion
OPENAI_MODEL=gpt-4.1-mini
```

## Start the application

From PowerShell, start the backend:

```powershell
python -m venv backend\.venv
backend\.venv\Scripts\python.exe -m pip install -r backend\requirement.txt
Set-Location backend
.venv\Scripts\python.exe -m uvicorn main:app --reload --port 8001
```

In a second terminal, start the frontend from the project root:

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` and sign in with the credentials configured in `.env.local`.

## Validation

```powershell
npm test
npm run lint
node --env-file=.env.local tests\integration-flow.mjs
```

The integration check expects the FastAPI backend to be running at `BACKEND_API_URL`.

## Security notes

- Keep `.env.local` and `backend/.env` private; both are ignored by Git.
- Change the development login password before sharing the app.
- Local sessions expire after eight hours and are protected with HMAC-SHA256 signatures.
- Hosted Sites use dispatch-owned Sign in with ChatGPT; local credentials are intended for local development or a controlled internal deployment.
- The AI agent is instructed to use read-only SQL and reject data-changing statements.
