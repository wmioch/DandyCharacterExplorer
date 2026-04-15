# Dandy's World Character Explorer

Static character calculator for **Dandy's World** with a lightweight Azure Functions feedback backend.

## Frontend

- Real-time stat calculations for toons, trinkets, items, and team abilities
- Twisted speed comparison table
- Machine extraction timing estimates
- Shareable build URL button
- Feedback modal that submits PollingStation-compatible payloads

## Local Run

This site must be served over HTTP. Do not open `index.html` with `file://`.

```bash
python -m http.server 8000
```

Then open `http://localhost:8000`.

`start_server.bat` is the repo-provided helper if you want the server lifecycle handled for you.

## Project Layout

```text
index.html
css/
  main.css
  components.css
  responsive.css
js/
  analytics-config.js
  analytics.js
  data-loader.js
  calculator.js
  ui.js
  app.js
  feedback-config.js
  feedback.js
data/
assets/
api/
  package.json
  host.json
  local.settings.json.example
  src/index.js
.github/workflows/deploy-dandy-feedback.yml
```

## Feedback Setup

The frontend feedback modal reads its deployment settings from `js/feedback-config.js`.

Set:

- `feedbackApiUrl` to `https://<FUNCTION_APP_NAME>.azurewebsites.net/api/feedback`
- `appVersion` to the frontend version string you want submitted

The backend lives in `api/` and deploys separately from the GitHub Pages frontend.

## Google Analytics Setup

The frontend Google Analytics tag reads its settings from `js/analytics-config.js`.

Set:

- `measurementId` to your GA4 web stream ID, for example `G-XXXXXXXXXX`
- `allowLocalhost` to `true` only if you want local page views sent during HTTP-served testing

If `measurementId` is empty, Analytics stays disabled. Localhost traffic is skipped by default even when the site is served with `python -m http.server`.

## Backend Deploy

Install backend dependencies from the `api/` folder:

```bash
cd api
npm ci
```

Deployment is handled by `.github/workflows/deploy-dandy-feedback.yml` on pushes to `main` that touch `api/**` or the workflow file.

Required GitHub configuration:

- repository secret: `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

## Notes

- `POST /api/feedback` is anonymous for browser submissions.
- `GET /api/feedback` requires `admin_token` and is meant for PollingStation polling only.
- Dandy-specific metadata is appended inside `feedback.message`; `ecg_case` stays `null`.
