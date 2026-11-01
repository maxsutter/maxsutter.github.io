# Local development

The site is static. Python 3 is the only requirement for the preview server;
no dependency installation or local configuration is needed to serve it.

Run `./dev` from the repository root. The server binds to localhost on port 8000,
or the first available higher port, and prints its complete URL after binding.
Use `./dev --port 8005` to require a specific port. An occupied explicit port
causes startup to fail. Press Ctrl+C to stop the server.

For the existing quality checks, install Node.js as specified in `package.json`
and run `npm ci` once. The checks are listed in `package.json`.

## Publication

`npm run build` creates a clean `dist/` directory from the explicit file allowlist
in `tools/build-site.mjs`, then validates its routes and local references.
Add new public pages and assets to that list. Internal documents, tests,
development tools, original photos and unlisted files are never copied.
The Flying Speaker Notes download, checksum and build metadata remain included.
Browser and Lighthouse checks run against `dist/`.
The browser suite starts its own server and refuses to reuse an occupied port.
If another task uses 4173, run `SITE_TEST_PORT=4174 npm run test:ci` with a free port.

GitHub Pages must use **Settings → Pages → Build and deployment → Source →
GitHub Actions**. The workflow checks the site before uploading only `dist/`
and deploying on `main`. Pull requests never deploy. Switching the repository
setting is a one-time release step before the first authorized push to `main`
containing this workflow. This prevents a parallel legacy build from publishing
the repository root. Until that setting changes, branch-based publication is
still active.

For a local check of the exact publication, run `npm run build`, then
`./dev --published`. Port selection and `--port` behave as described above.

## Dependency maintenance

Direct development dependencies are pinned to current stable versions. The
maintained `@eslint-community/eslint-plugin-eslint-comments` preserves the
existing lint rule with ESLint 10.

The `overrides` in `package.json` select fixed transitive releases while upstream
tools still depend on vulnerable versions: Lighthouse, chrome-launcher,
basic-ftp, tmp, minimatch, modern glob and uuid. Updating chrome-launcher removes
legacy rimraf/glob rather than pairing their old API with modern minimatch.
Lighthouse CI's `Launcher.getInstallations()` API remains available; Node 24
can load the newer ES module from CommonJS. uuid 11.1.1 preserves the CommonJS API.
Recheck these constraints when updating Lighthouse CI, then run `npm audit` and
the full `npm run test:ci` suite. Remove overrides when the upstream ranges
include the fixed versions.
