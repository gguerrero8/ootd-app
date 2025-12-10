# Deployment Overview

This document records how the OOTD app is deployed today, and where to plug in future AWS resources.

## Current State

- **Frontend**: React (Vite) app in `client/`, deployed via **AWS Amplify**.
- **Backend API**: Express app in `api/`.
  - Local dev: `npm run dev` (from `api/`) or `npm run dev` (from repo root, which runs `node api/index.js`).
  - Serverless Offline: `npm run offline` (from `api/`) to simulate API Gateway + Lambda (optional, for experimentation only).
- **Database**: Supabase project `utidbgtjlunudhlja`.

> Note: The project currently uses **Express + Amplify only** for production. A Serverless configuration and Lambda wrapper exist in the repo for potential future use, but **Lambda/API Gateway deployment is not part of the current plan**.

## Commands

### Backend (API)

From the repo root:

```bash
# Run Express API directly for local development
npm run dev
```

From the `api/` folder:

```bash
# Run Express API directly (local dev)
npm run dev

# Start Serverless Offline (simulated API Gateway + Lambda)
npm run offline

# Attempt to deploy via Serverless (requires AWS IAM permissions)
npm run deploy
```

### Frontend (Client)

From the `client/` folder:

```bash
# Local dev
npm run dev

# Production build
npm run build
```

## URLs and Resource IDs

### Frontend

- **Amplify frontend URL**: `TODO: paste Amplify app URL here`

### Backend API

- **Local Express API (direct)**: `http://localhost:3001`
- **Serverless Offline API**: `http://localhost:3000`
  - Health check: `http://localhost:3000/health`

### AWS Lambda / API Gateway (optional, not planned)

This project intentionally does **not** deploy Lambda or API Gateway in production. The Serverless setup is kept only as a reference/option for the future.

- **Lambda function name**: _not planned_
- **API Gateway ID**: _not planned_
- **Deployed API base URL**: _not planned_

## Known Serverless Deployment Notes (historical)

- A previous attempt to run `serverless deploy` failed with an IAM 
  `Access denied when storing the parameter "/serverless-framework/deployment/s3-bucket"` error.
- The IAM user `arn:aws:iam::350515822952:user/ootd-app-deploy` did **not** have sufficient permissions for SSM Parameter Store and the deployment S3 bucket at that time.

These notes are kept for reference only. Since Lambda/API Gateway are **not part of the current deployment strategy**, fixing these IAM permissions is optional and only required if you choose to adopt Serverless for production in the future.
