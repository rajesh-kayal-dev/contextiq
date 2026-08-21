# Deploying ContextIQ on Replit (Free Tier)

This guide walks you through the **complete, repeatable process** to get the full ContextIQ stack (frontend, API server, and collector) running on Replit without any credit‑card requirements.

---

## 📋 Prerequisites
1. A **GitHub account** with a fork/clone of the `contextiq` repository.
2. A **Replit account** (sign‑up at https://replit.com – no credit‑card needed).
3. API keys for the LLM you plan to use (e.g., Groq, OpenAI).
4. (Optional) a free Neon PostgreSQL database if you prefer a hosted vector store over the built‑in `lancedb`.

---

## 🚀 Quick one‑click deployment (high‑level)
1. **Create a new Replit from GitHub** – **Import from GitHub** → paste your repo URL.
2. **Add Replit Secrets** (environment variables).
3. **Run the project** – Replit will automatically build the frontend and start the combined server.
4. **Visit the public URL** (`https://<project>.replit.app`).
5. (Optional) **Set up an external cron job** to periodically trigger the collector.

---

## 🛠️ Detailed step‑by‑step instructions
### 1️⃣ Fork / clone the repo on GitHub
```bash
# On GitHub, click "Fork" to create your own copy.
# Then copy the HTTPS URL, e.g.
git clone https://github.com/<your‑username>/contextiq.git
cd contextiq
```
Make sure the repository contains the files we added earlier:
- `server/combined.js`
- `server/routes/cron.js`
- `frontend/.replit`
- `frontend/.env.example`
- Exported `runCollectorOnce` in `collector/src/collector.js`.

### 2️⃣ Create a new Replit project from the repo
1. Open https://replit.com and log in.
2. Click **"+ Create" → "Import from GitHub"**.
3. Paste the HTTPS URL of **your fork** (not the upstream repo) and click **"Import"**.
4. Replit will clone the repo into a new workspace.

### 3️⃣ Configure environment variables (Replit *Secrets*)
Open the **lock icon → Secrets** panel and add the following keys (do **not** commit `.env` to Git):
| Variable | Example value | Description |
|----------|---------------|-------------|
| `LLM_PROVIDER` | `groq` | Provider identifier used by ContextIQ.
| `GROQ_API_KEY` | `sk-xxxxxxxxxxxx` | Your Groq API key (or the key for whichever LLM you use).
| `VECTOR_DB` | `lancedb` **or** `neon` | Choose the built‑in DB or an external Neon instance.
| `NEON_URL` | `postgres://user:pw@host:5432/db` | Required only if `VECTOR_DB=neon`.
| `CRON_SECRET` | `a9F7$kL2pQ` (random string) | Secret token that protects the `/cron/run-collector` endpoint.

> **Tip:** Generate a random secret with `openssl rand -hex 12` locally.

### 4️⃣ Verify the `.replit` command
The file **`frontend/.replit`** should contain:
```toml
run = "npm install && npm run build && node ../server/combined.js"
```
This tells Replit to:
1. Install **all** workspace dependencies (`npm install`).
2. Build the Vite frontend (`npm run build`).
3. Launch the **combined server** that serves the built UI and the API.

### 5️⃣ Run the project
1. Click the **▶️ Run** button at the top of the Replit UI.
2. Replit will execute the command from `.replit`. You will see the following stages in the console:
   * `npm install` – installs server, frontend, collector deps.
   * `npm run build` – creates `frontend/dist`.
   * `Server listening on http://localhost:<PORT>` – the combined server is up.
3. When the console prints `✅ Initial collector run completed`, the first indexing pass is finished.

### 6️⃣ Open the live preview
Click **“Open in a new window”** (the external‑link icon). The URL will be of the form:
```
https://contextiq-<your‑username>.replit.app
```
You should see the ContextIQ UI. Test a basic API endpoint, e.g. `GET /api/health`, by appending it to the URL.

### 7️⃣ (Optional) Add a scheduled collector run
Because Replit’s free tier sleeps after 5 minutes of inactivity, you’ll want an external cron service to wake it up and run the collector occasionally.
1. **Choose a free cron provider** – e.g. https://cron-job.org/ or https://www.easycron.com/.
2. Create a new **POST** job with the URL:
```
https://<your‑project>.replit.app/cron/run-collector?secret=<CRON_SECRET>
```
3. Set the schedule you desire (e.g., `*/30 * * * *` for every 30 minutes).
4. Save the job. The provider will issue an HTTP request; Replit will wake, run `runCollectorOnce()`, then go back to sleep.

### 8️⃣ Verify the cron job works
After the first scheduled run, open the Replit **Logs** pane – you should see a line similar to:
```
✅ Initial collector run completed
```
followed by another line when the external request hits the endpoint:
```
Collector run completed
```
If you see a `403 Forbidden` error, double‑check that the `secret` query parameter matches the `CRON_SECRET` you set in Replit Secrets.

---

## 📦 Production‑ready considerations (still free)
| Concern | How to address on Replit (free) |
|---------|---------------------------------|
| **Persistent storage** | The free tier provides **200 MiB** of persistent disk. Keep your document corpus small (a few sample PDFs) or store embeddings in an external Neon DB. |
| **Cold start latency** | The first request after a sleep may take a few seconds while the REPL boots and the Vite bundle loads. Acceptable for demos. |
| **Scaling** | For higher traffic you would need a paid Replit plan or a different host (Fly.io, Render, etc.). |
| **Custom domain** | Not available on the free tier – you would need a paid plan to map `example.com` to your REPL. |

---

## ✅ Checklist (run after deployment)
- [ ] Replit project builds (`npm run build` succeeds).
- [ ] UI loads at the public URL.
- [ ] API endpoints reachable (`/api/...`).
- [ ] Collector runs once on startup (check console).
- [ ] `CRON_SECRET` is set and the `/cron/run-collector` endpoint returns 200 when called with the correct secret.
- [ ] External cron job (if configured) triggers the collector on schedule.

---

### 🎉 You’re done!
You now have a **fully functional, free‑tier, one‑click deploy** of ContextIQ on Replit.
Feel free to share the public URL, add more documents, or integrate additional LLM providers.

---

*This `deploy.md` file lives at the repository root.*
