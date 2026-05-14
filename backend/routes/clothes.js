const router   = require('express').Router();
const multer   = require('multer');
const axios    = require('axios');
const fs       = require('fs');
const FormData = require('form-data');
const auth     = require('../middleware/auth');
const pool     = require('../db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// 옷 등록
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: '이미지를 업로드해주세요' });

    let category = req.body.category || '상의';
    let color    = req.body.color    || '기타';

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

    const result = await pool.query(
      'INSERT INTO clothes (user_id, image_url, category, color, style_tags, memo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [req.userId, imageUrl, category, color, JSON.stringify(styleTags), memo]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 내 옷장 조회
router.get('/', auth, async (req, res) => {
  try {
    let query  = 'SELECT * FROM clothes WHERE user_id = $1';
    let params = [req.userId];
    let idx    = 2;

    if (req.query.category) {
      query += ` AND category = $${idx}`;
      params.push(req.query.category);
      idx++;
    }
    if (req.query.color) {
      query += ` AND color = $${idx}`;
      params.push(req.query.color);
    }

    query += ' ORDER BY created_at DESC';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 옷 상세 조회
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clothes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 옷 삭제
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM clothes WHERE id = $1 AND user_id = $2',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });

    const filePath = `.${result.rows[0].image_url}`;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await pool.query('DELETE FROM clothes WHERE id = $1', [req.params.id]);
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;