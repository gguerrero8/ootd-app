# Outfit of the Day (OOTD) App

This is the scaffolding for the **Outfit of the Day (OOTD)** web application.  
The app helps users generate outfit suggestions based on their wardrobe, weather, and events.

## Tech Stack
- React (Vite) client in `/client`
- Express API in `/api`
- Supabase database in `/supabase`

## Repository Structure
```
ootd-app/
├── client/ # React PWA (Vite)
├── api/ # Express API
├── supabase/ # SQL migrations + seeds
├── docs/ # PRD, site map, OpenAPI, deployment notes
├── README.md
└── .gitignore
```

## Live URLs & Environments

- **Frontend (Amplify)**: `TODO: paste Amplify app URL here`
- **Local API (Express)**: `http://localhost:3001`
- **Local API (Serverless Offline)**: `http://localhost:3000`

See `deployment.md` for more detailed deployment instructions and commands.

## Deployment Notes

- Backend API is implemented in `api/index.js` and can be run:
  - Via Express directly (local): `npm run dev` (from repo root or `api/`).
  - Via Serverless Offline (simulated API Gateway + Lambda): `npm run offline` (from `api/`, **optional for experimentation**).
- Serverless configuration lives in `api/serverless.yml` and `api/lambda.js`, but it is **not used for production deployment**.
- Production currently relies on **Express + Amplify only**. Lambda/API Gateway via Serverless is **not part of the active deployment plan**.

## Recorded Resource IDs

- **Supabase project**: `utidbgtqvtjlunudhlja`
- **Lambda function name**: _not planned_ (Serverless-based deployment is optional and currently unused).
- **API Gateway ID**: _not planned_ (Serverless-based deployment is optional and currently unused).

## Troubleshooting

- **API health check (local)**:
  - Express: `http://localhost:3001/health`
  - Serverless Offline: `http://localhost:3000/health`
- **Common issues**:
  - `vite: command not found` in CI/Amplify: ensure `client` dependencies are installed before `vite build`.
  - `No version found for 3` from Serverless: update `frameworkVersion` in `api/serverless.yml` to match the installed CLI (currently `'4'`).
  - `Access denied when storing the parameter "/serverless-framework/deployment/s3-bucket"`:
    - IAM user for deployment lacks SSM/S3 permissions; see `deployment.md` for required actions.

## Incomplete / Future Features

- Supabase-based auth (OTP) replacing the temporary `/login` lookup
- Advanced outfit suggestion logic (event/weather-based recommendations)

## Backup & Launch Prep

### Backups

- **Code**: Source code is stored in Git and should be pushed to a remote (e.g. GitHub) before any launch.
- **Environment variables**: Keep a copy of all required env vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE`, Supabase service keys) in a secure password manager or secrets store (not in Git).
- **Database (Supabase)**: Use the Supabase dashboard to export data or create backups/snapshots before making breaking schema changes.

### Pre-launch checklist

1. Verify the **Amplify frontend URL** is updated in `README.md` and `deployment.md`.
2. Confirm `VITE_API_BASE` in the Amplify environment points to the correct API.
3. Run local smoke tests:
   - Login flow (`/login` → `/`)
   - Closet, outfits, collections, feed pages load without errors.
4. Check the app on mobile and desktop viewport sizes.
5. Ensure `.env` files are **not** committed to Git.

### Launch announcement (template)

You can use this as a starting point for your launch message (email, social, or internal doc):

> **Outfit of the Day (OOTD) is live!**
> 
> OOTD helps you manage your closet, build outfits, and share looks with a simple web app.
> 
> Try it here: `<AMPLIFY_URL>`
> 
> Current features:
> - Store items in your digital closet
> - Create and rate outfits
> - Organize collections
> - View a simple feed of posts
> 
> This is an early version; your feedback will directly shape what we build next.

### Feedback plan

- Include a **feedback link** in the app footer or README (e.g. Google Form, email address, or GitHub Issues link).
- Ask early users to report:
  - Bugs (what they did, what happened, screenshot if possible)
  - Usability issues (confusing flows, missing confirmations)
  - Feature requests (what would make the app more useful day-to-day)
- Review feedback on a regular cadence (e.g. weekly) and turn items into tasks in your tracker.
