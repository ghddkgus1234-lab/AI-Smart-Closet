import React, { useState, useEffect } from 'react';
import axios from 'axios';
import WeatherCard from './components/WeatherCard';
import UploadSection from './components/UploadSection';
import ResultCard from './components/ResultCard';
import './App.css';

// ✅ 날씨 API 키 (OpenWeatherMap)
const API_KEY = "9a4909d36ac857cdfdaff16d2c682280";

// ✅ 날씨 구간별 추천 의류 매핑 (백엔드 없이 프론트에서 직접 처리)
const WEATHER_MAPPING = {
  hot:    { range: [25, 50],  items: ['Top', 'Dress'],                    label: '더운 날씨' },
  mild:   { range: [15, 25],  items: ['Top', 'Bottom', 'Dress'],          label: '따뜻한 날씨' },
  chilly: { range: [5,  15],  items: ['Top', 'Bottom', 'Outer', 'Dress'], label: '쌀쌀한 날씨' },
  cold:   { range: [-30, 5],  items: ['Outer', 'Bottom'],                 label: '추운 날씨' },
};

// ✅ AI 모델 시뮬레이션 (백엔드 연결 전까지 랜덤 예측)
//    → 나중에 백엔드 완성 시 이 함수만 axios.post()로 교체하면 됩니다
const CLASS_NAMES = ['Top', 'Bottom', 'Outer', 'Dress'];
function simulateAIPrediction() {
  const idx = Math.floor(Math.random() * 4);
  const confidence = 0.55 + Math.random() * 0.40;
  const probs = CLASS_NAMES.map((_, i) =>
    i === idx ? confidence : Math.random() * (1 - confidence) / 3
  );
  return { predicted_class: CLASS_NAMES[idx], confidence, probs };
}

function getWeatherStatus(temp, predictedClass) {
  for (const [, val] of Object.entries(WEATHER_MAPPING)) {
    const [lo, hi] = val.range;
    if (temp >= lo && temp < hi) {
      const pass = val.items.includes(predictedClass);
      return {
        status: pass ? 'PASS' : 'FAIL',
        weatherLabel: val.label,
        recommendedItems: val.items,
        comment: pass
          ? `✨ 완벽해요! ${temp.toFixed(1)}°C ${val.label}에 ${predictedClass}은(는) 아주 좋은 선택입니다.`
          : `⚠️ ${temp.toFixed(1)}°C ${val.label}에는 ${val.items.join(', ')} 계열이 더 적합해요.`,
      };
    }
  }
  return { status: 'UNKNOWN', weatherLabel: '', recommendedItems: [], comment: '' };
}

export default function App() {
  const [city, setCity]               = useState('Seoul');
  const [cityInput, setCityInput]     = useState('Seoul');
  const [weather, setWeather]         = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [preview, setPreview]         = useState(null);
  const [result, setResult]           = useState(null);
  const [analyzing, setAnalyzing]     = useState(false);

  useEffect(() => { fetchWeather('Seoul'); }, []);

  const fetchWeather = async (cityName) => {
    setWeatherLoading(true);
    setResult(null);
    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric&lang=kr`
      );
      setWeather({
        city:        res.data.name,
        temp:        res.data.main.temp,
        feels_like:  res.data.main.feels_like,
        humidity:    res.data.main.humidity,
        wind_speed:  res.data.wind.speed,
        description: res.data.weather[0].description,
        weather_main:res.data.weather[0].main,
      });
    } catch {
      setWeather({ error: true });
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleFileChange = (file) => {
    setResult(null);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleAnalyze = async () => {
    if (!preview || !weather || weather.error) return;
    setAnalyzing(true);
    setResult(null);

    // 시뮬레이션 딜레이 (실제감 부여)
    await new Promise(r => setTimeout(r, 1200));

    const { predicted_class, confidence, probs } = simulateAIPrediction();
    const { status, weatherLabel, recommendedItems, comment } =
      getWeatherStatus(weather.temp, predicted_class);

    setResult({
      predicted_class,
      confidence,
      probs,
      status,
      weatherLabel,
      recommendedItems,
      comment,
      temp: weather.temp,
      weather_desc: weather.description,
    });
    setAnalyzing(false);
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    setCity(cityInput);
    fetchWeather(cityInput);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-icon">👗</span>
          K-Fashion Weather Recommender
        </h1>
        <p className="app-subtitle">AI가 날씨에 맞는 옷을 추천해드립니다</p>
      </header>

      <form className="city-form" onSubmit={handleCitySearch}>
        <input
          className="city-input"
          value={cityInput}
          onChange={e => setCityInput(e.target.value)}
          placeholder="도시 입력 (영문, 예: Seoul, Busan, Tokyo)"
        />
        <button className="city-btn" type="submit">🔍 조회</button>
      </form>

      <div className="grid-layout">
        <div className="left-panel">
          <WeatherCard weather={weather} loading={weatherLoading} />
          <UploadSection
            preview={preview}
            onFileChange={handleFileChange}
            onAnalyze={handleAnalyze}
            analyzing={analyzing}
            hasFile={!!preview}
            weatherReady={!!(weather && !weather.error)}
          />
        </div>
        <div className="right-panel">
          {result
            ? <ResultCard result={result} preview={preview} />
            : (
              <div className="placeholder-card">
                <div className="placeholder-icon">✨</div>
                <p>옷 이미지를 업로드하고<br/>분석 버튼을 눌러주세요</p>
                <small>Top / Bottom / Outer / Dress 분류</small>
              </div>
            )
          }
        </div>
      </div>
    </div>
  );
}
