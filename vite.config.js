import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'mock-api-students',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === '/api/students') {
            res.setHeader('Content-Type', 'application/json');
            const dataPath = path.resolve(__dirname, 'src/data/students.json');
            const data = fs.readFileSync(dataPath, 'utf-8');
            res.end(data);
          } else {
            next();
          }
        });
      }
    }
  ],
});

