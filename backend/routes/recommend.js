const router   = require('express').Router();
const axios    = require('axios');
const auth     = require('../middleware/auth');
const pool     = require('../db');
const fs       = require('fs');
const FormData = require('form-data');

function getRecommendedCategories(temp) {
  if (temp >= 25) return ['상의', '하의'];
  if (temp >= 15) return ['상의', '하의', '아우터'];
  if (temp >= 5)  return ['상의', '하의', '아우터'];
  return ['상의', '하의', '아우터'];
}

// 오늘의 코디 추천
router.get('/today', auth, async (req, res) => {
  try {
    const { lat = 37.5665, lon = 126.9780 } = req.query;

    let temp = 15;
    let weather = '정보 없음';
    try {
      const weatherRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric`
      );
      temp    = weatherRes.data.main.temp;
      weather = weatherRes.data.weather[0].description;
    } catch {
      console.warn('날씨 API 실패 — 기본값 사용');
    }

    const categories = getRecommendedCategories(temp);
    const result = {};
    for (const cat of categories) {
      const { rows } = await pool.query(
        'SELECT * FROM clothes WHERE user_id = $1 AND category = $2',
        [req.userId, cat]
      );
      if (rows.length > 0) {
        result[cat] = rows[Math.floor(Math.random() * rows.length)];
      }
    }

    res.json({ temp, weather, categories, recommendation: result });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 유사 옷 추천
router.post('/similar', auth, async (req, res) => {
  try {
    const { clothId } = req.body;
    const { rows } = await pool.query(
      'SELECT * FROM clothes WHERE id = $1 AND user_id = $2',
      [clothId, req.userId]
    );
    if (rows.length === 0) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });

    const cloth = rows[0];
    const form  = new FormData();
    form.append('file', fs.createReadStream(`.${cloth.image_url}`));
    const aiRes = await axios.post(`${process.env.FASTAPI_URL}/recommend/`, form, {
      headers: form.getHeaders(),
      timeout: 15000,
    });

    res.json(aiRes.data);
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

module.exports = router;