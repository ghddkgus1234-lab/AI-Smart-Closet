const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

const makeToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname)
      return res.status(400).json({ message: '모든 항목을 입력해주세요' });

    const checkResult = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (checkResult.rows.length > 0)
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (email, password, nickname) VALUES ($1, $2, $3) RETURNING id',
      [email, hashed, nickname]
    );

    res.status(201).json({ token: makeToken(result.rows[0].id), nickname });
  } catch (err) {
    console.error('회원가입 에러:', err);
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다' });

    res.json({ token: makeToken(user.id), nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 내 정보
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, nickname, created_at FROM users WHERE id = $1',
    [req.userId]
  );
  res.json(result.rows[0]);
});

module.exports = router;