# Thieez site

Minimal SvelteKit site for the Thieez project index and Lisnnto download page.

## Development

```bash
npm install
npm run dev
```

Set `VITE_API_BASE` to point at a local API during development; production defaults to
`https://api.thieez.com`. The page detects `lisnnto.thieez.com` via
`window.location.hostname`. For local testing, use `/?project=lisnnto`.

The project index requests `GET /projects/v0`, accepting either a project array
or `{ "projects": [...] }`. Until that endpoint exists, a 404/405 intentionally
uses the built-in Lisnnto entry as the documented fallback; other API failures
remain visible as an error state. Asset download URLs are resolved against the
API origin, including when the API returns a relative path.

## Build and deploy

```bash
npm run check
npm run build
npm run preview
```

Point both the apex/site host and `lisnnto.thieez.com` at the deployed SvelteKit
application. The API must allow the site origins in its CORS policy, including the
production domains and any local development origin.
