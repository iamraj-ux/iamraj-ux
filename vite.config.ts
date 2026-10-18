import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { handleGeminiChat, handleActionPrompt, handleGitHubSync } from './src/server/apiHandler.ts';

dotenv.config();

function apiServerPlugin(): Plugin {
  return {
    name: 'api-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        if (req.method === 'GET' && req.url === '/api/health') {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              status: 'online',
              server: 'Raj Expo Digitals Server v5.6',
              uptime: process.uptime(),
              timestamp: new Date().toISOString(),
            })
          );
          return;
        }

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => {
            bodyStr += chunk;
          });
          req.on('end', async () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              if (req.url === '/api/gemini/chat') {
                const data = await handleGeminiChat(body);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              }
              if (req.url === '/api/gemini/action') {
                const data = await handleActionPrompt(body);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              }
              if (req.url === '/api/github/sync') {
                const data = await handleGitHubSync(body);
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
                return;
              }
              res.statusCode = 404;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Endpoint not found' }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Internal server error' }));
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
