import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [clothes, setClothes] = useState([]);
  const [filter, setFilter] = useState('전체');
  const [loading, setLoading] = useState(true);

  // 1. 백엔드 데이터 가져오기
  useEffect(() => {
    // 소윤님이 DB 문을 열어주면 실제로 데이터를 가져오기 시작합니다!
    axios.get('http://localhost:5000/api/clothes')
      .then(response => {
        setClothes(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.log("서버 연결을 기다리는 중입니다...");
        setLoading(false);
      });
  }, []);

  // 2. 카테고리 필터링 로직
  const filteredClothes = filter === '전체' 
    ? clothes 
    : clothes.filter(item => item.category === filter);

  return (
    <div style={styles.container}>
      {/* 헤더 섹션 */}
      <header style={styles.header}>
        <h1 style={styles.title}>👗 AI Smart Closet</h1>
        <p style={styles.subtitle}>오늘 아현님에게 가장 잘 어울리는 옷을 찾아드려요.</p>
      </header>

      {/* 대시보드: 날씨 및 추천 */}
      <div style={styles.dashboard}>
        <div style={styles.card}>
          <div style={{fontSize: '32px'}}>☀️</div>
          <h3 style={styles.cardTitle}>오늘의 날씨</h3>
          <p style={styles.cardContent}>22°C / 맑음</p>
        </div>
        <div style={styles.cardHighlight}>
          <div style={{fontSize: '32px'}}>✨</div>
          <h3 style={styles.cardTitle}>AI 추천 코디</h3>
          <p style={styles.cardContent}>화이트 셔츠 + 슬랙스</p>
        </div>
      </div>

      <main style={styles.main}>
        {/* 필터 바 */}
        <div style={styles.filterBar}>
          {['전체', '상의', '하의', '아우터', '신발'].map(cat => (
            <button 
              key={cat} 
              onClick={() => setFilter(cat)}
              style={{
                ...styles.filterBtn,
                backgroundColor: filter === cat ? '#4C6EF5' : 'white',
                color: filter === cat ? 'white' : '#4A5568',
                boxShadow: filter === cat ? '0 4px 12px rgba(76, 110, 245, 0.3)' : 'none'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* 옷장 그리드 */}
        <div style={styles.grid}>
          {filteredClothes.length > 0 ? (
            filteredClothes.map((item, index) => (
              <div key={index} style={styles.clothesCard}>
                <div style={styles.icon}>
                  {item.category === '상의' ? '👕' : item.category === '하의' ? '👖' : '👟'}
                </div>
                <h4 style={styles.clothesName}>{item.name}</h4>
                <div style={styles.tagGroup}>
                  <span style={styles.tag}>{item.color}</span>
                  <span style={styles.tag}>{item.category}</span>
                </div>
              </div>
            ))
          ) : (
            // 데이터가 없을 때 보여줄 안내 문구
            <div style={styles.emptyState}>
              <div style={{fontSize: '50px', marginBottom: '20px'}}>📦</div>
              <p>{filter} 카테고리에 등록된 옷이 없습니다.</p>
              <p style={{fontSize: '14px', color: '#CBD5E0'}}>소윤님이 DB 설정을 마치면 데이터가 나타납니다!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ✨ 세련된 모던 디자인 스타일
const styles = {
  container: {
    backgroundColor: '#F8FAFC',
    minHeight: '100vh',
    padding: '60px 20px',
    fontFamily: "'Pretendard', -apple-system, sans-serif",
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px',
  },
  title: {
    fontSize: '3rem',
    fontWeight: '800',
    color: '#1E293B',
    letterSpacing: '-1px',
  },
  subtitle: {
    color: '#64748B',
    fontSize: '1.2rem',
    marginTop: '10px',
  },
  dashboard: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
    marginBottom: '60px',
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '24px',
    width: '240px',
    textAlign: 'center',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
  },
  cardHighlight: {
    backgroundColor: '#EEF2FF',
    padding: '30px',
    borderRadius: '24px',
    width: '240px',
    textAlign: 'center',
    border: '2px solid #4C6EF5',
    boxShadow: '0 10px 25px -5px rgba(76, 110, 245, 0.1)',
  },
  cardTitle: {
    fontSize: '1.1rem',
    color: '#475569',
    margin: '15px 0 5px 0',
  },
  cardContent: {
    fontSize: '1.2rem',
    fontWeight: '700',
    color: '#1E293B',
  },
  main: {
    maxWidth: '1100px',
    margin: '0 auto',
  },
  filterBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: '12px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  filterBtn: {
    padding: '12px 24px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'all 0.2s ease',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '30px',
  },
  clothesCard: {
    backgroundColor: 'white',
    padding: '40px 20px',
    borderRadius: '24px',
    textAlign: 'center',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.3s ease',
    cursor: 'pointer',
  },
  icon: {
    fontSize: '60px',
    marginBottom: '20px',
  },
  clothesName: {
    fontSize: '1.25rem',
    color: '#1E293B',
    marginBottom: '15px',
  },
  tagGroup: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
  },
  tag: {
    backgroundColor: '#F1F5F9',
    padding: '6px 12px',
    borderRadius: '10px',
    fontSize: '0.85rem',
    color: '#64748B',
    fontWeight: '500',
  },
  emptyState: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    padding: '80px 20px',
    backgroundColor: '#FFFFFF',
    borderRadius: '32px',
    border: '2px dashed #E2E8F0',
    color: '#94A3B8',
  }
};

export default App;