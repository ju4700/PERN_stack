import express from 'express';
import authRoutes from './routes/authRoutes.js';

const app = express();
const port = 3000;

app.use(express.json());
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});