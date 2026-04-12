const router  = require('express').Router();
const multer  = require('multer');
const axios   = require('axios');
const fs      = require('fs');
const FormData = require('form-data');
const auth    = require('../middleware/auth');
const Cloth   = require('../models/Cloth');

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

// 옷 등록 (이미지 업로드 + AI 분석)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '이미지를 업로드해주세요' });

    // FastAPI AI 서버에 분석 요청
    let category = req.body.category || '상의';
    let color    = req.body.color    || '기타';
    let embedding = [];

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path));
      const aiRes = await axios.post(`${process.env.FASTAPI_URL}/analyze/`, form, {
        headers: form.getHeaders(),
        timeout: 10000,
      });
      category  = aiRes.data.category;
      color     = aiRes.data.color;
      embedding = aiRes.data.embedding;
    } catch {
      console.warn('AI 서버 연결 실패 — 수동 입력값 사용');
    }

    const cloth = await Cloth.create({
      user:     req.userId,
      imageUrl: `/uploads/${req.file.filename}`,
      category,
      color,
      embedding,
      styleTags: req.body.styleTags ? JSON.parse(req.body.styleTags) : [],
      memo:      req.body.memo || '',
    });

    res.status(201).json(cloth);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 내 옷장 조회 (카테고리/색상 필터)
router.get('/', auth, async (req, res) => {
  try {
    const filter = { user: req.userId };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.color)    filter.color    = req.query.color;

    const clothes = await Cloth.find(filter).sort({ createdAt: -1 });
    res.json(clothes);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 옷 상세 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const cloth = await Cloth.findOne({ _id: req.params.id, user: req.userId });
    if (!cloth) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });
    res.json(cloth);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 옷 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const cloth = await Cloth.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!cloth) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });
    // 파일도 같이 삭제
    const filePath = `.${cloth.imageUrl}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;
