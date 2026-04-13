# Dandy Character Explorer Feedback Backend Handoff

## Goal

Add a lightweight feedback system to `DandyCharacterExplorer` without changing its static-site hosting model.

The site should stay on GitHub Pages as a plain static frontend. A small Azure Functions backend should accept feedback submissions, store them in Azure Table Storage, and expose a polling endpoint that `PollingStation` can read.

Do **not** use `PollingStation.Backend`. This backend belongs to `DandyCharacterExplorer` itself.

## Target Architecture

```text
GitHub Pages frontend
  -> POST https://<FUNCTION_APP_NAME>.azurewebsites.net/api/feedback
  -> Azure Table Storage
  -> PollingStation polls GET /api/feedback?after=...&limit=...&admin_token=...
```

## Existing Constraints

- `DandyCharacterExplorer` is a static site with no build step and no framework.
- Keep the frontend lightweight.
- Do not introduce React, Vue, Vite, or any heavy tooling.
- The live site origin is `https://wmioch.github.io`.
- `PollingStation` expects the feedback payload and polling response shape used by its existing sources.

Reference contract:
- [FeedbackContracts.cs](D:/Projects/PollingStation/src/PollingStation.Contracts/Models/FeedbackContracts.cs)

Relevant live-site metadata:
- [index.html](D:/Projects/DandyCharacterExplorer/index.html#L15)

## What The Coding Agent Should Implement

### 1. Add a backend folder inside the Dandy repo

Create:

```text
api/
```

This should be a Node.js Azure Functions app using the Azure Functions Node v4 model.

Keep dependencies minimal:

- `@azure/functions`
- `@azure/data-tables`

No extra frameworks unless absolutely required.

### 2. Implement these HTTP endpoints

Create three endpoints:

- `POST /api/feedback`
- `GET /api/feedback`
- `GET /api/healthz`

### 3. Use Azure Table Storage

Use the Function App storage connection already available through `AzureWebJobsStorage`.

Use one table:

- default table name: `DandyFeedback`
- make the table name configurable through `FEEDBACK_TABLE_NAME`

Use:

- `partitionKey = "feedback"`
- `rowKey = sortable UTC cursor`, for example:

```text
20260413T081500123Z_ab12cd
```

Each stored entity should include at least:

- `partitionKey`
- `rowKey`
- `receivedAt`
- `submittedAt`
- `message`
- `appName`
- `appVersion`
- `platform`
- `payloadJson`

### 4. Accept this POST payload shape

`POST /api/feedback` must accept JSON in this format:

```json
{
  "submitted_at": "2026-04-13T00:00:00.000Z",
  "feedback": {
    "message": "User message plus Dandy context"
  },
  "app": {
    "name": "Dandy Character Explorer",
    "version": "1.0.0",
    "platform": "web"
  },
  "ecg_case": null
}
```

Behavior:

- Validate that `feedback.message` is present and non-empty after trimming.
- Validate that `submitted_at` is a parseable date.
- Validate that `app.name`, `app.version`, and `app.platform` exist.
- Store the full original payload in `payloadJson`.
- Return HTTP `202 Accepted` on success.

Do not require authentication for `POST`.

### 5. Implement the polling endpoint for PollingStation

`GET /api/feedback` must:

- require `admin_token` query parameter
- compare it against `FEEDBACK_ADMIN_TOKEN`
- reject unauthorized requests with `401`
- support:
  - `after`
  - `limit`

Response shape must be:

```json
{
  "items": [
    {
      "id": "20260413T081500123Z_ab12cd",
      "received_at": "2026-04-13T08:15:00.123Z",
      "submitted_at": "2026-04-13T08:14:58.000Z",
      "feedback": {
        "message": "..."
      },
      "app": {
        "name": "Dandy Character Explorer",
        "version": "1.0.0",
        "platform": "web"
      },
      "ecg_case": null
    }
  ],
  "next_cursor": "20260413T081500123Z_ab12cd"
}
```

Behavior:

- `after` means return only items with IDs strictly greater than that cursor.
- `limit` should default to a sensible value such as `100`.
- clamp `limit` to a reasonable max such as `200`.
- order results ascending by cursor.
- `next_cursor` should be the ID of the last returned item, or `null` when there are no items.

`ecg_case` should always be `null` for Dandy.

### 6. Add a health endpoint

`GET /api/healthz` should return:

- HTTP `200`
- tiny JSON body such as:

```json
{ "ok": true }
```

### 7. Add a lightweight frontend feedback UI

Implement a minimal frontend feedback flow using plain HTML/CSS/JavaScript:

- one feedback button
- one small modal, drawer, or panel
- one textarea
- one submit button
- simple success and failure message

Do not add a framework.

### 8. Frontend submission behavior

The frontend should post to:

```text
https://<FUNCTION_APP_NAME>.azurewebsites.net/api/feedback
```

Add a small config constant in the frontend JS for this URL.

The frontend should build the feedback payload in the PollingStation-compatible shape and send JSON with `fetch`.

### 9. Put Dandy-specific context into the message body

Do **not** invent a new schema for Dandy-specific fields.

Follow the same idea used in PEARL: append context into the `feedback.message` string. For example:

```text
<user typed message>

---
Dandy context
URL: https://wmioch.github.io/DandyCharacterExplorer/
Selected toon: ...
Selected trinkets: ...
Selected items: ...
Team state: ...
Browser: ...
```

This keeps `PollingStation` compatible without requiring any viewer or schema changes.

`ecg_case` must remain:

```json
null
```

Relevant reference for this pattern:
- [feedbackApi.ts](D:/Projects/PEARLOnline/apps/web/src/lib/feedbackApi.ts)

## Suggested Backend File Structure

This structure is acceptable:

```text
api/
  package.json
  host.json
  local.settings.json.example
  src/
    index.js
    shared/
      config.js
      storage.js
      validation.js
      cursor.js
```

The exact layout can vary, but keep it small.

## GitHub Auto-Deploy Requirements

Add a GitHub Actions workflow:

```text
.github/workflows/deploy-dandy-feedback.yml
```

The workflow should:

- trigger on push to `main`
- only run when:
  - `api/**` changes
  - `.github/workflows/deploy-dandy-feedback.yml` changes
- use:
  - `actions/checkout`
  - `actions/setup-node`
  - `npm ci` in `api`
  - `Azure/functions-action@v1`
- deploy using repository secret:
  - `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
- deploy to the Function App name baked into the workflow:
  - `dandy-feedback-prod`

The workflow should deploy the Azure Function backend only. It should not replace the existing GitHub Pages setup for the static site.

## Manual Steps Required

These steps are not optional.

### 1. Create the Azure Function App

In Azure Portal, create a Function App with:

- Publish: `Code`
- Runtime stack: `Node.js`
- Version: `22`
- Operating system: `Windows`
- Plan: `Consumption`

Why: Azure Functions marks the Windows Consumption plan as legacy for new apps, but it still supports Windows code deployments. `Node.js 20` support is near end-of-support in Azure Functions on **2026-04-30**, so new deployments should target `Node.js 22`.

When you create the app, choose a final app name up front. Example:

- `dandy-feedback-prod`

That name becomes the live hostname:

- `https://dandy-feedback-prod.azurewebsites.net`

You will reuse that exact app name later in GitHub and in the frontend config.

### 2. Configure Function App settings

Add these application settings:

- `FEEDBACK_ADMIN_TOKEN=<long random secret>`
- `FEEDBACK_TABLE_NAME=DandyFeedback`

Do not put the admin token in frontend code.

Use these exact values/formats:

- `FEEDBACK_TABLE_NAME`
  - value: `DandyFeedback`
  - leave this exactly as written unless you have a reason to rename the table

- `FEEDBACK_ADMIN_TOKEN`
  - value: a long random secret string used only by PollingStation when calling `GET /api/feedback`
  - recommended format: at least 32 random bytes encoded as hex or base64url
  - example hex value:
    - `9f3b7a7ef7d1c6bb7f1b87f4b6f0d6d83c96d8ab3d3f5d685b3b9554d4cf62a1`

PowerShell example to generate one:

```powershell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Store this token somewhere safe. You will need the same exact value again later for PollingStation.

### 3. Configure CORS

In the Azure Function App CORS settings, add:

- `https://wmioch.github.io`

That is the browser origin that needs to be allowed.

### 4. Add GitHub deployment secret

Download the Function App publish profile from Azure Portal.

Before downloading it, make sure **SCM Basic Auth Publishing Credentials** is enabled for the Function App. Azure publish-profile downloads do not work when that setting is off.

In the GitHub repository settings for `wmioch/DandyCharacterExplorer`, add this repository secret:

- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`

- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE`
  - value: the full XML contents of the publish profile file you download from Azure
  - do not paste the filename
  - do not trim it down
  - it should look like XML starting with something similar to:

```xml
<publishData><publishProfile ...
```

The workflow uses:

- the baked-in Function App name `dandy-feedback-prod` to know which Function App to deploy to
- `AZURE_FUNCTIONAPP_PUBLISH_PROFILE` to authenticate that deployment

### 5. Configure the frontend feedback URL

After the Function App exists, update:

- [js/feedback-config.js](D:/Projects/DandyCharacterExplorer/js/feedback-config.js)

Set:

- `feedbackApiUrl=https://<FUNCTION_APP_NAME>.azurewebsites.net/api/feedback`

This step is required because GitHub Pages is serving a static frontend and does not provide runtime environment-variable injection for this URL.

Example:

If your Function App name is:

- `dandy-feedback-prod`

then set:

```js
window.DandyFeedbackConfig = Object.freeze({
  feedbackApiUrl: 'https://dandy-feedback-prod.azurewebsites.net/api/feedback',
  appVersion: '1.0.0'
});
```

You can leave `appVersion` as `1.0.0` for the first rollout, or change it to whatever frontend version label you want submitted with feedback.

### 6. Push to main

After the coding agent adds the backend and workflow, push to `main`.

That push should trigger automatic deployment of the backend. Future pushes affecting `api/**` should update it automatically.

### 7. Verify backend deployment

After deployment, manually verify:

- `https://<FUNCTION_APP_NAME>.azurewebsites.net/api/healthz`

Then submit one feedback item from the live frontend and confirm it succeeds.

Using the example app name above, that health URL would be:

- `https://dandy-feedback-prod.azurewebsites.net/api/healthz`

Expected response:

```json
{ "ok": true }
```

Then test the live site:

1. Open `https://wmioch.github.io/DandyCharacterExplorer/`
2. Click `Send Feedback`
3. Enter a short test message
4. Submit
5. Confirm the UI reports success

## PollingStation Changes Needed Afterwards

Once the Azure Function is live, add a new source to:

- [sources.json](D:/Projects/PollingStation/src/PollingStation.App/sources.json)

Add an entry like this:

```json
{
  "sourceId": "dandy-character-explorer",
  "name": "Dandy Character Explorer",
  "adapterType": "cursor_rest_v1",
  "baseUrl": "https://<FUNCTION_APP_NAME>.azurewebsites.net",
  "pollPath": "/api/feedback",
  "adminTokenSecretName": "pollingstation:dandy-character-explorer-admin-token",
  "pollIntervalMinutes": 60,
  "batchSize": 100,
  "enabled": true,
  "authMode": "query",
  "adminTokenQueryParameter": "admin_token"
}
```

Then store the same admin token in Windows Credential Manager under:

```text
pollingstation:dandy-character-explorer-admin-token
```

Important: the value stored under that Windows Credential Manager entry must be the exact same string you used earlier for `FEEDBACK_ADMIN_TOKEN`.

## End-to-End Example

If you choose:

- Function App name: `dandy-feedback-prod`
- Admin token: `9f3b7a7ef7d1c6bb7f1b87f4b6f0d6d83c96d8ab3d3f5d685b3b9554d4cf62a1`

then your manual values become:

- Azure app setting `FEEDBACK_ADMIN_TOKEN`
  - `9f3b7a7ef7d1c6bb7f1b87f4b6f0d6d83c96d8ab3d3f5d685b3b9554d4cf62a1`
- Azure app setting `FEEDBACK_TABLE_NAME`
  - `DandyFeedback`
- `js/feedback-config.js` `feedbackApiUrl`
  - `https://dandy-feedback-prod.azurewebsites.net/api/feedback`
- PollingStation `baseUrl`
  - `https://dandy-feedback-prod.azurewebsites.net`
- Windows Credential Manager secret `pollingstation:dandy-character-explorer-admin-token`
  - `9f3b7a7ef7d1c6bb7f1b87f4b6f0d6d83c96d8ab3d3f5d685b3b9554d4cf62a1`

## Security Rules

- Frontend: anonymous `POST` only
- PollingStation: authenticated `GET` only
- Never expose `FEEDBACK_ADMIN_TOKEN` in browser JavaScript
- Never commit secrets to the repository

## Notes For The Coding Agent

- Keep this implementation boring and small.
- Match the existing PollingStation-compatible payload and response shapes exactly.
- Avoid introducing a custom schema for Dandy-specific context.
- Keep all Dandy-specific context embedded in `feedback.message`.
- Do not migrate the site away from GitHub Pages.
- Do not add a heavy frontend stack.

## References

- [FeedbackContracts.cs](D:/Projects/PollingStation/src/PollingStation.Contracts/Models/FeedbackContracts.cs)
- [index.html](D:/Projects/DandyCharacterExplorer/index.html#L15)
- [feedbackApi.ts](D:/Projects/PEARLOnline/apps/web/src/lib/feedbackApi.ts)
- [Azure Functions GitHub Actions](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-github-actions)
- [Azure Functions CORS](https://learn.microsoft.com/en-us/azure/azure-functions/functions-how-to-use-azure-function-app-settings#cross-origin-resource-sharing)
- [Azure Functions Node reference](https://learn.microsoft.com/en-us/azure/azure-functions/functions-reference-node)
- [Azure Tables JavaScript client](https://learn.microsoft.com/en-us/javascript/api/overview/azure/data-tables-readme?view=azure-node-latest)
