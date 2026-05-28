# Production URLs

| Service | URL |
|---------|-----|
| Frontend (Vercel) | https://scholar-final.vercel.app |
| Backend (Render) | https://scholarfinal.onrender.com |

## Vercel (client)

Production build reads `client/.env.production` (committed):

- `VITE_API_URL=https://scholarfinal.onrender.com`

After pushing to GitHub, Vercel redeploys automatically. Or trigger **Redeploy** in Vercel dashboard.

Optional: also set `VITE_API_URL` in Vercel → Settings → Environment Variables (overrides file if set).

## Render (server)

In Render → Environment, ensure:

```env
CORS_ORIGIN=https://scholar-final.vercel.app
ADMIN_EMAIL=aranyeah02@gmail.com
ATLAS_URI=<your mongodb uri>
GEMINI_API_KEY=<your key>
SEMANTIC_SCHOLAR_API_KEY=<optional>
```

Do **not** set `PORT` on Render.

Health check: https://scholarfinal.onrender.com/api/health

## Auth0

Add to Application settings:

- Allowed Callback URLs: `https://scholar-final.vercel.app`, `http://localhost:5173`
- Allowed Logout URLs: same
- Allowed Web Origins: same
