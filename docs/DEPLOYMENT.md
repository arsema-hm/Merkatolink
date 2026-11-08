# GitHub and deployment

## Current status

You can publish this source code to GitHub as a portfolio project. The current app is **not ready to run as a public hosted demo**. Its API uses a local JSON file store by default, has no real sign-in or authorization, and exposes demo order creation, listing and status updates without authentication. Anyone who can reach a deployed demo API could view or change its fictional demo orders. Do not enter real customer or business information.

The default web app calls `http://localhost:4000`. A hosted frontend will not be able to use your computer's local API. Setting `VITE_API_URL` to a public API address only changes where the browser sends requests; it does not secure the API or make its local JSON data durable. In production mode the API also does not automatically switch to the demo JSON store.

## Publish the code to GitHub

1. Sign in to GitHub and choose **New repository**.
2. Choose a repository name such as `merkatolink`. Choose Public or Private.
3. Leave **Add a README**, **.gitignore** and **license** unchecked. This project already has its own files and Git history.
4. Create the repository. On the GitHub page, copy its HTTPS URL.
5. In VS Code, open this project folder's terminal and review what will be included:

```powershell
git status
```

6. Stage and commit the project, then connect the remote and push. Replace the URL with the one GitHub showed you:

```powershell
git add -A
git commit -m "Complete MerkatoLink demo and documentation"
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If `git remote add origin` says that `origin` already exists, inspect it with `git remote -v`; update it with `git remote set-url origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git` before pushing. Do not commit `.env`, access keys, passwords, or real personal data. `.gitignore` excludes the local demo data and environment file; still inspect `git status` before committing.

## Before hosting a public interactive demo

Complete these items first:

1. Add real authentication and enforce owner/staff authorization on every private API route. In particular, protect the demo account, order listing, order status and checkout endpoints, or remove these routes from public builds.
2. Replace the local JSON store with a persistent database and verify migrations, constraints and access policies against that database. A hosted service's local filesystem may be ephemeral; Render documents that local file changes are lost on deploy or restart by default ([Render filesystem and deploy behavior](https://render.com/docs/deploys)).
3. Configure the API's `WEB_ORIGIN` to the exact deployed frontend URL and set the frontend build variable `VITE_API_URL` to the API URL. These are public URLs, not secrets. Keep database credentials and signing secrets in the host's secret settings, never in Vite variables or committed files.
4. Test order creation, stock changes, order privacy, restart behavior, HTTPS and error handling against fictional data before sharing the link.

After these changes, the architecture can use a static frontend host and a Node API host. Vite frontend deployments are supported by Vercel ([Vite deployment guide](https://vercel.com/docs/frameworks/frontend/vite)); a Fastify service must bind to `0.0.0.0` and the host-provided `PORT` (Render's requirement is described in its [web service docs](https://render.com/docs/web-services)). The repository currently has no hosting configuration or credentials, and no deployment has been created.

## Keep the demo safe

- All seeded businesses, people, contact details, products, prices and orders are fictional.
- The local profile form is not account authentication.
- Do not use this application for real payments, tax accounting or business records.
- Never put secrets in `VITE_*` variables; frontend values are included in the browser bundle.
