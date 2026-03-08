import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import statsRouter from './routes/stats';
import authRouter from './routes/auth';

const app = express();
const port = process.env.PORT ?? 3000;

const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:5173';

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/', (_req, res) => {
  res.send('MergeStats API is running! Use /api/stats endpoint for data.');
});

app.use('/auth', authRouter);
app.use('/api/stats', statsRouter);

app.listen(port, () => {
  console.log(`MergeStats API running on http://localhost:${port}`);
});
