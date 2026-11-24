# Testing and reproducibility

## Automated backend tests

```bash
cd server
npm ci
npm test
```

The Node.js test suite covers authentication, role and tenant checks, protected file paths, self-certification upload handling, LLM offer ranking, and route-controller error cases.

## Static checks

Run the JavaScript and Python syntax checks locally with:

```bash
find server -name '*.js' -not -path '*/node_modules/*' -exec node --check {} \;
python -m py_compile vosk_docker_server/server.py
```

## Frontend commands

The React portal uses Create React App:

```bash
cd client_company
npm ci
npm run build
```

The React Native application uses Expo. From `client/`, run `npm ci`, followed by `npm start`, and choose a supported Android or iOS development environment. The mobile app is not configured as a web target.
