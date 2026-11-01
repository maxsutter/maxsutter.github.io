# Local development

The site is static. Python 3 is the only requirement for the preview server;
no dependency installation or local configuration is needed to serve it.

Run `./dev` from the repository root. The server binds to localhost on port 8000,
or the first available higher port, and prints its complete URL after binding.
Use `./dev --port 8005` to require a specific port. An occupied explicit port
causes startup to fail. Press Ctrl+C to stop the server.

For the existing quality checks, install Node.js as specified in `package.json`
and run `npm ci` once. The checks are listed in `package.json`.

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
