import { Router } from 'express';
import env from 'dotenv';
await env.config();
import app from './app.js';
import dbConnect from './db.js';


const PORT = process.env.PORT || 8000;

const startServer = async () => {
  console.log('Starting server initialization...');
  await dbConnect();
  console.log('Database connected');
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API is available at: http://localhost:${PORT}/api/v1`);
  });
};

startServer();

