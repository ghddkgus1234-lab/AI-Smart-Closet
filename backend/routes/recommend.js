const router = require('express').Router();
const axios  = require('axios');
const auth   = require('../middleware/auth');
const Cloth  = require('../models/Cloth');
const fs     = require('fs');
const FormData = require('form-data');

// 날씨 기반 카테고리 추천 로직
function getRecommendedCategories(temp) {
  if (temp >= 25) return ['상의', '하의'];           // 더움
  if (temp >= 15) return ['상의', '하의', '아우터']; // 선선
  if (temp >= 5)  return ['상의', '하의', '아우터']; // 쌀쌀
  return ['상의', '하의', '아우터'];                  // 추움
}

// 오늘의 코디 추천 (날씨 기반)
router.get('/today', auth, async (req, res) => {
  try {
    const { lat = 37.5665, lon = 126.9780 } = req.query; // 기본값: 서울

    // OpenWeather API 호출
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

    // 사용자 옷장에서 카테고리별 랜덤 1개씩 추천
    const result = {};
    for (const cat of categories) {
      const clothes = await Cloth.find({ user: req.userId, category: cat });
      if (clothes.length > 0) {
        result[cat] = clothes[Math.floor(Math.random() * clothes.length)];
      }
    }

    res.json({ temp, weather, categories, recommendation: result });
  } catch (err) {
    res.status(500).json({ message: '서버 오류', error: err.message });
  }
});

// 사진 기반 유사 옷 추천 (FastAPI 연동)
router.post('/similar', auth, async (req, res) => {
  try {
    const { clothId } = req.body;
    const cloth = await Cloth.findOne({ _id: clothId, user: req.userId });
    if (!cloth) return res.status(404).json({ message: '옷을 찾을 수 없습니다' });

    // FastAPI에 이미지 전송해서 유사 옷 추천
    const form = new FormData();
    form.append('file', fs.createReadStream(`.${cloth.imageUrl}`));
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
