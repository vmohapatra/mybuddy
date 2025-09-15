## Deploy frontend to Cloudflare Pages (Yarn)

### Prerequisites
- Node.js 20.19.0
- GitHub repository access
- Cloudflare account with Pages enabled

### 1) Prepare the frontend
- Use Yarn (do not mix npm and Yarn):
  - Commit `frontend/yarn.lock`
  - Remove `frontend/package-lock.json` if present
- Ensure dependencies:
  - `react-markdown` and `remark-gfm` in dependencies
  - `csp-html-webpack-plugin@^5.1.0` in devDependencies
- SPA redirects (so deep-link routes work):
  - During build, generate `dist/_redirects` with:
    ```bash
    echo '/* /index.html 200' > dist/_redirects
    ```

### 2) Connect Cloudflare Pages
1. Cloudflare Dashboard → Pages → Create project → Connect to GitHub → select this repo
2. Configure build:
   - Project root: `frontend`
   - Build output directory: `dist`
   - Environment variables:
     - `NODE_VERSION = 20.19.0`
   - Build command (choose one):
     - Yarn 4 (Corepack):
       ```
       yarn install --immutable && yarn build && echo '/* /index.html 200' > dist/_redirects
       ```
     - Yarn 1 (Classic):
       ```
       yarn install --frozen-lockfile && yarn build && echo '/* /index.html 200' > dist/_redirects
       ```

### 3) Backend integration
- Set API base URL in `frontend/services/api.ts` to your backend domain:
  - Example: `https://api.example.com/api/v1`
- Ensure backend CORS allows your Pages origin (`https://<project>.pages.dev` or custom domain)

### 4) Verify deployment
- Visit the Pages URL (e.g., `https://<project>.pages.dev`)
- Navigate directly to a deep route (e.g., `/dashboard/search`) — should not 404 (thanks to `_redirects`)
- Open browser DevTools → Network: API requests should go to your backend and return expected responses

### 5) Optional: Pages Functions API proxy
- To avoid CORS and keep a relative API path:
  - Create `frontend/functions/api/[[path]].ts` that forwards requests to your backend
  - Then set `baseURL` in `frontend/services/api.ts` to `/api`
- Minimal example (TypeScript):
  ```ts
  export const onRequest: PagesFunction = async (context) => {
    const backend = 'https://api.example.com'; // change to your backend
    const url = new URL(context.request.url);
    const target = backend + url.pathname.replace(/^\/api/, '') + (url.search || '');
    const init: RequestInit = {
      method: context.request.method,
      headers: context.request.headers,
      body: ['GET','HEAD'].includes(context.request.method) ? undefined : await context.request.text(),
    };
    const resp = await fetch(target, init);
    return new Response(resp.body, { status: resp.status, headers: resp.headers });
  };
  ```

### 6) Common issues
- Build fails: `csp-html-webpack-plugin` version not found
  - Use `^5.1.0` in devDependencies
- SPA routes 404 on refresh
  - Ensure `dist/_redirects` contains: `/* /index.html 200`
- CORS errors
  - Allow your Pages domain in backend CORS, or use the Pages Functions proxy

### 7) CLI alternative (Wrangler)
```bash
npm i -g wrangler
wrangler login
cd frontend
yarn install && yarn build
echo '/* /index.html 200' > dist/_redirects
wrangler pages project create mybuddy-frontend
wrangler pages deploy dist --project-name mybuddy-frontend
```


