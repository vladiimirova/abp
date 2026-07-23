import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import riaHandler from './api/vehicles.js';

function localRiaApi(apiKey) {
  return {
    name: 'local-ria-api',
    configureServer(server) {
      server.middlewares.use('/api/vehicles', async (request, response) => {
        const url = new URL(request.url, 'http://localhost');
        const query = Object.fromEntries(url.searchParams);
        const previousKey = process.env.AUTO_RIA_API_KEY;
        process.env.AUTO_RIA_API_KEY = apiKey;

        const vercelLikeResponse = {
          statusCode: 200,
          setHeader(name, value) {
            response.setHeader(name, value);
          },
          status(code) {
            this.statusCode = code;
            return this;
          },
          json(payload) {
            response.statusCode = this.statusCode;
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify(payload));
          },
        };

        try {
          await riaHandler({ query }, vercelLikeResponse);
        } finally {
          if (previousKey === undefined) delete process.env.AUTO_RIA_API_KEY;
          else process.env.AUTO_RIA_API_KEY = previousKey;
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      localRiaApi(env.AUTO_RIA_API_KEY),
    ],
    server: {
      host: '127.0.0.1',
    },
  };
});
