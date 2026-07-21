import express from 'express';
const app = express();
import router from './routes/router.js';


app.use(express.json());

// Global request logger middleware
app.use((req, res, next) => {
  console.log(`\n>>> [${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

app.use('/api/v1', router);

export default app;

