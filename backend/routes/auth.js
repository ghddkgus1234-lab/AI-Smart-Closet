const router  = require('express').Router();
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const pool    = require('../db');

const makeToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body;
    if (!username || !password || !nickname)
      return res.status(400).json({ message: '모든 항목을 입력해주세요' });

    const checkResult = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    if (checkResult.rows.length > 0)
      return res.status(400).json({ message: '이미 사용 중인 아이디입니다' });

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (username, password, nickname) VALUES ($1, $2, $3) RETURNING id',
      [username, hashed, nickname]
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
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // ← 추가
    const { username, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: '아이디 또는 비밀번호가 틀렸습니다' });

    res.json({ token: makeToken(user.id), nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 내 정보
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const result = await pool.query(
    'SELECT id, username, nickname, created_at FROM users WHERE id = $1',
    [req.userId]
  );
  res.json(result.rows[0]);
});


// 비밀번호 변경
router.put('/password', require('../middleware/auth'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];
    if (!(await bcrypt.compare(currentPassword, user.password)))
      return res.status(401).json({ message: '현재 비밀번호가 틀렸습니다' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, req.userId]);
    res.json({ message: '비밀번호 변경 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 회원탈퇴
router.delete('/withdraw', require('../middleware/auth'), async (req, res) => {
  try {
    await pool.query('DELETE FROM clothes WHERE user_id = $1', [req.userId]);
    await pool.query('DELETE FROM users WHERE id = $1', [req.userId]);
    res.json({ message: '회원탈퇴 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;