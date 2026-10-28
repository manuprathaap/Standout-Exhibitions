# Standout Portfolio

A React portfolio viewer and visual editor for Standout Exhibitions & Events. The starter portfolio uses selected project photography and client marks embedded in the supplied 2025 company profile.

## Run locally

1. Install Node.js 20 or newer.
2. Install dependencies with `npm install`.
3. Start the app with `npm run dev`.
4. Open the Vite URL shown in the terminal (normally `http://localhost:5174`).
5. Visit `/admin` and create the first editor account. The initial portfolio is published; saving changes creates a private draft until you publish again.

The development server runs the React/Vite client and the Express API together. `npm run build` creates the production client bundle. To serve that bundle from Express, set `NODE_ENV=production` and run `npm start`.

## Features

- Responsive client-facing portfolio with service browsing, project filters and image galleries.
- Admin account setup, signed HTTP-only session cookie, hashed password storage and protected editor APIs.
- Visual section editor with live section preview, visibility, duplicate/delete controls, reordering, theme color and draft/publish workflow.
- Full project, service and client-logo CRUD with reorder controls, editable image alt text, image uploads/media selection, and a replaceable company logo; media persists under `data/uploads`.
- Draft data and the last published version are stored separately. Public portfolio routes return only the published snapshot.
- Shareable `/portfolio/standout` link and print-ready portfolio export (choose “Save as PDF” in the browser print dialog).
- Real company profile imagery and client logos bundled in `public/media`.

## Deployment notes

The included server persists data and uploaded images on its local filesystem. For cross-device links, deploy the app behind HTTPS on a stable public domain and use a persistent server volume for the `data` directory. Back up `data/portfolio.json` and `data/uploads` together. Ephemeral hosting filesystems will lose saved changes and images on restart; configure a persistent volume or migrate the storage layer to a managed database and object store before using such a host. Set `PORT` as required by the host.

The first editor account can only be created once. Protect the server and its data volume, use a unique strong password, and keep the deployment updated. The included JSON store is intended for a single-instance starter deployment; use a transactional database and shared session storage when scaling to multiple server instances.

### Deploying on Vercel

The Vercel deployment uses the Express API as a serverless function. Before deploying, connect a Neon Postgres database and a Vercel Blob store to the Vercel project. Set `DATABASE_URL` and `BLOB_READ_WRITE_TOKEN` for the deployment, and add a `SESSION_SECRET` containing at least 32 random characters. For example, generate one with `node -e "console.log(require('node:crypto').randomBytes(48).toString('base64url'))"`. Never commit these values.

The first request initializes the database with the starter portfolio if it is empty; visit `/admin` to create the editor account. Portfolio data and admin credentials are stored in Postgres. Uploaded images go directly from the browser to Blob, avoiding Vercel's server request-size limit. The bundled `/media` images remain part of the deployment.

Local `data/portfolio.json` and `data/uploads` are intentionally ignored by Git and are not automatically copied to Vercel. To preserve them, connect the Vercel project integrations, pull its environment with `npx vercel env pull .env.local`, then run `npm run migrate:vercel` before creating the Vercel editor account. The migration script refuses to overwrite a database that already has an editor account unless `--overwrite` is explicitly added to the script command. Otherwise, the first Vercel request starts with the bundled starter portfolio.
