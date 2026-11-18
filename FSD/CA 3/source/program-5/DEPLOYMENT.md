# Deployment — Ledgerly

The project is deployment-ready but this submission does not claim a live public URL or include credentials.

## MongoDB Atlas

1. Create a free MongoDB Atlas cluster and a database user with a strong password.
2. Allow the backend host's network access and copy the connection URI.
3. Keep the URI secret; never commit it to Git.

## Backend — Render

1. Push the project to GitHub and create a Render Web Service from `render.yaml`.
2. Set `MONGO_URI` to the Atlas URI and `CLIENT_ORIGIN` to the Vercel frontend URL.
3. Render runs `npm start` from the server directory and checks `/api/health`.
4. Leave `USE_MEMORY_DB` unset or `false` in production.

## Frontend — Vercel

1. Import the same repository into Vercel and choose the `client` directory as the project root.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Set `VITE_API_URL=https://your-api.onrender.com/api` in Vercel environment variables.
4. Deploy, then update Render's `CLIENT_ORIGIN` with the exact Vercel origin.

The Vercel rewrite supports client-side routes, CORS restricts browser origins, and Mongoose persists records in MongoDB Atlas.
