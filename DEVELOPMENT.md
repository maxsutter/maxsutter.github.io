# Local development

The site is static. Python 3 is the only requirement for the preview server;
no dependency installation or local configuration is needed to serve it.

Run `./dev` from the repository root. The server binds to localhost on port 8000,
or the first available higher port, and prints its complete URL after binding.
Use `./dev --port 8005` to require a specific port. An occupied explicit port
causes startup to fail. Press Ctrl+C to stop the server.

For the existing quality checks, install Node.js as specified in `package.json`
and run `npm ci` once. The checks are listed in `package.json`.
