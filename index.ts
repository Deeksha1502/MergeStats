import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import statsRouter from './routes/stats';

if (!process.env.GITHUB_TOKEN) {
  console.error('Error: GitHub token not found. Please set GITHUB_TOKEN in your .env file.');
  process.exit(1);
}

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('MergeStats API is running! Use /api/stats endpoint for data.');
});

app.use('/api/stats', statsRouter);

app.listen(port, () => {
  console.log(`MergeStats API running on http://localhost:${port}`);
});
