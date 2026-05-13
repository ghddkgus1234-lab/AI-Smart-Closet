require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes      = require('./routes/auth');
const clothesRoutes   = require('./routes/clothes');
const recommendRoutes = require('./routes/recommend');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth',      authRoutes);
app.use('/api/clothes',   clothesRoutes);
app.use('/api/recommend', recommendRoutes);

app.get('/', (req, res) => res.json({ status: 'ok', service: 'smart-closet-backend' }));

app.listen(process.env.PORT, () => {
  console.log(`서버 실행 중: http://localhost:${process.env.PORT}`);
});