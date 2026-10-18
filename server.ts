import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { handleGeminiChat, handleActionPrompt, handleGitHubSync } from './src/server/apiHandler.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Health & System status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    server: 'Raj Expo Digitals Server v5.6',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    aiModel: 'gemini-3.8-flash',
  });
});

// Gemini Chat Endpoint (Natasha v5.6)
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const data = await handleGeminiChat(req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Chat API Error:', error);
    res.status(500).json({ error: error.message || 'Error processing AI chat' });
  }
});

// Action-specific prompt execution (Ask AI, Write, Labels, Descriptions, Gmail, WhatsApp, etc.)
app.post('/api/gemini/action', async (req: Request, res: Response) => {
  try {
    const data = await handleActionPrompt(req.body);
    res.json(data);
  } catch (error: any) {
    console.error('Action API Error:', error);
    res.status(500).json({ error: error.message || 'Error executing action prompt' });
  }
});

// GitHub Sync Endpoint
app.post('/api/github/sync', async (req: Request, res: Response) => {
  try {
    const result = await handleGitHubSync(req.body);
    res.json(result);
  } catch (error: any) {
    console.error('GitHub Sync API Error:', error);
    res.status(500).json({ success: false, error: error.message || 'GitHub Sync failed' });
  }
});

// Serve Vite build assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req: Request, res: Response) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Raj Expo Digitals Server is listening on http://0.0.0.0:${port}`);
});
