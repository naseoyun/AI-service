import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import analyzeRoute from './routes/analyze.js';
import marketRoute from './routes/market.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.use('/company/analyze', analyzeRoute);
app.use('/market', marketRoute);

app.listen(PORT, () => {
  console.log(`✅ company-api running on http://localhost:${PORT}`);
});

app.use((req, res, next) => { res.setHeader('Content-Type', 'application/json; charset=utf-8'); next(); });