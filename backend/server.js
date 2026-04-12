require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes    = require('./routes/auth');
const clothesRoutes = require('./routes/clothes');
const recommendRoutes = require('./routes/recommend');

const app = express();

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());
app.use('/uploads', express.static('uploads')); // 업로드 이미지 정적 서빙

// 라우터 연결
app.use('/api/auth',      authRoutes);
app.use('/api/clothes',   clothesRoutes);
app.use('/api/recommend', recommendRoutes);

// 헬스체크
app.get('/', (req, res) => res.json({ status: 'ok', service: 'smart-closet-backend' }));

// MongoDB 연결 후 서버 시작
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB 연결 성공');
    app.listen(process.env.PORT, () => {
      console.log(`서버 실행 중: mongodb+srv://jangsoyun030908:sosoyunyun03@cluster0.gugobhv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
`);
    });
  })
  .catch(err => console.error('MongoDB 연결 실패:', err));
