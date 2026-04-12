import React from 'react';
import './WeatherCard.css';

const EMOJI = {
  Clear:'☀️', Clouds:'☁️', Rain:'🌧️', Drizzle:'🌦️',
  Snow:'❄️', Thunderstorm:'⛈️', Mist:'🌫️', Fog:'🌫️',
};

function tempInfo(t) {
  if (t >= 25) return { label:'더운 날씨',    color:'#f5a623', bg:'rgba(245,166,35,0.15)' };
  if (t >= 15) return { label:'따뜻한 날씨',  color:'#2ecc71', bg:'rgba(46,204,113,0.15)' };
  if (t >=  5) return { label:'쌀쌀한 날씨',  color:'#3498db', bg:'rgba(52,152,219,0.15)' };
  return               { label:'추운 날씨',    color:'#9b59b6', bg:'rgba(155,89,182,0.15)' };
}

export default function WeatherCard({ weather, loading }) {
  if (loading) return (
    <div className="wcard wcard-loading">
      <div className="spinner" /><p>날씨 불러오는 중...</p>
    </div>
  );
  if (!weather || weather.error) return (
    <div className="wcard wcard-error">
      <span>⚠️</span><p>날씨 정보를 불러올 수 없습니다<br/><small>도시명을 영문으로 입력해주세요</small></p>
    </div>
  );

  const emoji = EMOJI[weather.weather_main] || '🌡️';
  const info  = tempInfo(weather.temp);

  return (
    <div className="wcard" style={{ borderColor: info.color + '55' }}>
      <div className="wcard-top">
        <div>
          <p className="wcard-city">{weather.city}</p>
          <p className="wcard-desc">{weather.description}</p>
        </div>
        <span className="wcard-emoji">{emoji}</span>
      </div>
      <div className="wcard-temp">{weather.temp.toFixed(1)}<span className="wcard-unit">°C</span></div>
      <div className="wcard-label" style={{ background: info.bg, color: info.color }}>
        {info.label}
      </div>
      <div className="wcard-details">
        <div className="wcard-detail-item"><span>💧</span><div><small>습도</small><b>{weather.humidity}%</b></div></div>
        <div className="wcard-detail-item"><span>💨</span><div><small>풍속</small><b>{weather.wind_speed}m/s</b></div></div>
        <div className="wcard-detail-item"><span>🌡️</span><div><small>체감</small><b>{weather.feels_like?.toFixed(1)}°C</b></div></div>
      </div>
    </div>
  );
}
