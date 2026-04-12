const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const User   = require('../models/User');

const makeToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// 회원가입
router.post('/register', async (req, res) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || !nickname)
      return res.status(400).json({ message: '모든 항목을 입력해주세요' });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: '이미 사용 중인 이메일입니다' });

    const user = await User.create({ email, password, nickname });
    res.status(201).json({ token: makeToken(user._id), nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 로그인
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: '이메일 또는 비밀번호가 틀렸습니다' });

    res.json({ token: makeToken(user._id), nickname: user.nickname });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 내 정보
router.get('/me', require('../middleware/auth'), async (req, res) => {
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

module.exports = router;
