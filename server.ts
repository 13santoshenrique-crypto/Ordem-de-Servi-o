
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import os from 'os';

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), 'db.json');

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Simple JSON DB Handler
const getDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    return {};
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return content ? JSON.parse(content) : {};
  } catch (e) {
    console.error("Error reading DB:", e);
    return {};
  }
};

const saveDB = (data: any) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error saving DB:", e);
  }
};

// Generic API Handlers
const createHandler = (key: string) => {
  app.get(`/api/${key}`, (req, res) => {
    const db = getDB();
    res.json(db[key] || []);
  });

  app.post(`/api/${key}`, (req, res) => {
    const db = getDB();
    db[key] = req.body;
    saveDB(db);
    res.json({ success: true });
  });
};

// Register API Routes
const ENTITIES = [
  'orders', 'inventory', 'users', 'expenses', 
  'assets', 'units', 'recurring', 'tst_audit', 'action_plans', 'resets',
  'audit_logs', 'notifications', 'audit_simulations', 'audit_templates'
];

ENTITIES.forEach(key => createHandler(key));

// Special Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: process.env.NODE_ENV });
});

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (ifaceList) {
      for (const iface of ifaceList) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  }
  return 'localhost';
}

async function startServer() {
  try {
    console.log("Starting server...");
    
    // Vite middleware for development
    if (process.env.NODE_ENV !== 'production') {
      console.log("Initializing Vite middleware...");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      // Serve static files in production
      const distPath = path.join(process.cwd(), 'dist');
      if (fs.existsSync(distPath)) {
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
          res.sendFile(path.join(distPath, 'index.html'));
        });
      }
    }

    const localIP = getLocalIP();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 SGI-Aviagen Server Ready!`);
      console.log(`> Local:   http://localhost:${PORT}`);
      console.log(`> Network: http://${localIP}:${PORT}`);
      console.log(`\nTo access from another computer, use the Network URL above.\n`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
