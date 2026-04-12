# K-Fashion Weather Recommender 🌤️👗

## 실행 방법 (VS Code)

### 1. Node.js 설치 확인
```bash
node -v   # v18 이상 권장
npm -v
```

### 2. 패키지 설치 & 실행
```bash
npm install
npm start
```
→ 브라우저에서 http://localhost:3000 자동 실행

## 기능
- 🌤️ 실시간 날씨 조회 (OpenWeatherMap API 직접 호출)
- 📸 이미지 업로드 (클릭 / 드래그&드롭)
- 🤖 AI 분류 시뮬레이션 (Top / Bottom / Outer / Dress)
- 📊 카테고리별 확률 분포 시각화
- ✅ 날씨 적합성 판정 (PASS / FAIL)
- 💡 날씨별 추천 의류 태그

## 백엔드 연결 시
App.js 내 simulateAIPrediction() 함수를
axios.post('http://localhost:5000/predict', formData) 로 교체하면 됩니다.
