import React from 'react';
import './ResultCard.css';

const CAT_INFO = {
  Top:    { ko:'상의',   icon:'👕', tip:'티셔츠 · 셔츠 · 블라우스 · 니트' },
  Bottom: { ko:'하의',   icon:'👖', tip:'바지 · 팬츠 · 스커트' },
  Outer:  { ko:'아우터', icon:'🧥', tip:'코트 · 재킷 · 점퍼 · 패딩' },
  Dress:  { ko:'원피스', icon:'👗', tip:'드레스 · 원피스' },
};
const CLASS_NAMES = ['Top','Bottom','Outer','Dress'];

export default function ResultCard({ result, preview }) {
  if (!result) return null;
  const { predicted_class, confidence, probs, status, comment, recommendedItems, temp, weather_desc } = result;
  const cat   = CAT_INFO[predicted_class] || {};
  const isPASS = status === 'PASS';

  return (
    <div className={`rcard ${isPASS ? 'pass' : 'fail'}`}>
      {/* 헤더 */}
      <div className="rcard-header">
        <span className="badge" style={{ background: isPASS ? '#27ae60' : '#c0392b' }}>
          {isPASS ? '✓ PASS' : '✗ FAIL'}
        </span>
        <span className="rcard-weather">{temp?.toFixed(1)}°C · {weather_desc}</span>
      </div>

      {/* 메인 영역 */}
      <div className="rcard-main">
        {preview && <img src={preview} alt="outfit" className="rcard-img" />}
        <div className="rcard-info">
          <div className="cat-icon">{cat.icon}</div>
          <div className="cat-name">{predicted_class}</div>
          <div className="cat-ko">{cat.ko}</div>
          <div className="cat-tip">{cat.tip}</div>
          {/* 신뢰도 바 */}
          <div className="conf-wrap">
            <span className="conf-label">신뢰도</span>
            <div className="conf-track">
              <div className="conf-fill"
                style={{ width:`${(confidence*100).toFixed(0)}%`,
                         background: isPASS ? '#27ae60' : '#e94560' }} />
            </div>
            <span className="conf-pct">{(confidence*100).toFixed(1)}%</span>
          </div>
        </div>
      </div>

      {/* 전체 확률 분포 */}
      <div className="prob-section">
        <p className="prob-title">카테고리별 확률</p>
        {CLASS_NAMES.map((cls, i) => (
          <div key={cls} className="prob-row">
            <span className="prob-name">{CAT_INFO[cls].icon} {cls}</span>
            <div className="prob-track">
              <div className="prob-fill"
                style={{ width:`${(probs[i]*100).toFixed(0)}%`,
                         background: cls === predicted_class ? '#e94560' : '#334' }} />
            </div>
            <span className="prob-val">{(probs[i]*100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      {/* 코멘트 */}
      <div className={`rcard-comment ${isPASS ? 'cp' : 'cf'}`}>{comment}</div>

      {/* 추천 아이템 태그 */}
      <div className="rec-section">
        <p className="rec-title">📌 이 날씨에 어울리는 옷</p>
        <div className="rec-tags">
          {['Top','Bottom','Outer','Dress'].map(item => (
            <span key={item}
              className={`rec-tag ${recommendedItems.includes(item) ? 'active' : ''}`}>
              {CAT_INFO[item].icon} {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
