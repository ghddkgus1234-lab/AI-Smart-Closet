const router   = require('express').Router();
const multer   = require('multer');
const axios    = require('axios');
const fs       = require('fs');
const FormData = require('form-data');
const auth     = require('../middleware/auth');
const pool     = require('../db');

// 이미지 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 옷 등록 (이미지 업로드 + AI 분석)
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '이미지를 업로드해주세요' });

    let category  = req.body.category || '상의';
    let color     = req.body.color    || '기타';

    try {
      const form = new FormData();
      form.append('file', fs.createReadStream(req.file.path));
      const aiRes = await axios.post(`${process.env.FASTAPI_URL}/analyze/`, form, {
        headers: form.getHeaders(),
        timeout: 10000,
      });
      category = aiRes.data.category;
      color    = aiRes.data.color;
    } catch {
      console.warn('AI 서버 연결 실패 — 수동 입력값 사용');
    }

    const styleTags = req.body.styleTags ? JSON.parse(req.body.styleTags) : [];
    const memo      = req.body.memo || '';
    const imageUrl  = `/uploads/${req.file.filename}`;

    const [result] = await pool.query(
      'INSERT INTO clothes (user_id, image_url, category, color, style_tags, memo) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, imageUrl, category, color, JSON.stringify(styleTags), memo]
    );

    const [rows] = await pool.query('SELECT * FROM clothes WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 내 옷장 조회 (카테고리/색상 필터)
router.get('/', auth, async (req, res) => {
  try {
    let query  = 'SELECT * FROM clothes WHERE user_id = ?';
    let params = [req.userId];

    if (req.query.category) {
      query += ' AND category = ?';
      params.push(req.query.category);
    }
    if (req.query.color) {
      query += ' AND color = ?';
      params.push(req.query.color);
    }

    query += ' ORDER BY created_at DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 옷 상세 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clothes WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 옷 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM clothes WHERE id = ? AND user_id = ?',
      [req.params.id, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });

    const filePath = `.${rows[0].image_url}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM clothes WHERE id = ?', [req.params.id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;