import React, { useState, useEffect } from 'react';

const SAMPLE_OUTFITS = [
  {
    id: 1,
    title: '캐주얼 데일리룩',
    description: '화이트 티셔츠 + 청바지 + 스니커즈',
    weather: '15°C 이상',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80',
    tags: ['캐주얼', '데일리', '봄/여름'],
  },
  {
    id: 2,
    title: '오피스 룩',
    description: '블라우스 + 슬랙스 + 플랫슈즈',
    weather: '모든 날씨',
    image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e51?w=400&q=80',
    tags: ['오피스', '포멀', '올시즌'],
  },
  {
    id: 3,
    title: '스트릿 룩',
    description: '후드티 + 조거팬츠 + 운동화',
    weather: '10°C 이상',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    tags: ['스트릿', '편안함', '가을'],
  },
];

function getWeatherDesc(code) {
  if (code === 0) return { text: '맑음', emoji: '☀️' };
  if (code <= 2) return { text: '구름 조금', emoji: '🌤' };
  if (code === 3) return { text: '흐림', emoji: '☁️' };
  if (code <= 49) return { text: '안개', emoji: '🌫' };
  if (code <= 59) return { text: '이슬비', emoji: '🌦' };
  if (code <= 69) return { text: '비', emoji: '🌧' };
  if (code <= 79) return { text: '눈', emoji: '❄️' };
  if (code <= 84) return { text: '소나기', emoji: '🌧' };
  if (code <= 99) return { text: '뇌우', emoji: '⛈' };
  return { text: '알 수 없음', emoji: '🌈' };
}

function getOutfitTip(temp) {
  if (temp >= 28) return '민소매 + 반바지 조합';
  if (temp >= 23) return '반팔 + 반바지 조합';
  if (temp >= 17) return '긴팔 셔츠 + 슬랙스';
  if (temp >= 10) return '맨투맨 + 청바지';
  if (temp >= 5) return '코트 + 니트 추천';
  return '두꺼운 패딩 필수!';
}

function App() {
  const [clothes, setClothes] = useState(() => {
    try {
      const saved = localStorage.getItem('closet_clothes');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [filter, setFilter] = useState('전체');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '상의', color: '', imageUrl: '' });
  const [previewUrl, setPreviewUrl] = useState('');
  const [recommendation, setRecommendation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // 날씨 불러오기 (Open-Meteo, API 키 불필요, 서울 기준)
  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=37.5665&longitude=126.9780&current=temperature_2m,weathercode&timezone=Asia%2FSeoul')
      .then(res => res.json())
      .then(data => {
        const temp = Math.round(data.current.temperature_2m);
        const code = data.current.weathercode;
        const { text, emoji } = getWeatherDesc(code);
        setWeather({ temp, text, emoji });
        setWeatherLoading(false);
      })
      .catch(() => {
        setWeather({ temp: '--', text: '날씨 정보 없음', emoji: '🌈' });
        setWeatherLoading(false);
      });
  }, []);

  // 옷장 저장
  useEffect(() => {
    localStorage.setItem('closet_clothes', JSON.stringify(clothes));
  }, [clothes]);

  // 코디 추천
  useEffect(() => {
    if (clothes.length > 0) {
      const tops = clothes.filter(c => c.category === '상의');
      const bottoms = clothes.filter(c => c.category === '하의');
      const outers = clothes.filter(c => c.category === '아우터');
      setRecommendation({
        top: tops[Math.floor(Math.random() * tops.length)],
        bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
        outer: outers[Math.floor(Math.random() * outers.length)],
      });
    } else {
      setRecommendation(null);
    }
  }, [clothes]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
      setNewItem(prev => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddClothes = () => {
    if (!newItem.name) return alert('이름을 입력해주세요!');
    setClothes(prev => [...prev, { ...newItem, id: Date.now() }]);
    setNewItem({ name: '', category: '상의', color: '', imageUrl: '' });
    setPreviewUrl('');
    setShowAddModal(false);
  };

  const handleDelete = (id) => setClothes(prev => prev.filter(c => c.id !== id));

  const reshuffleRecommendation = () => {
    const tops = clothes.filter(c => c.category === '상의');
    const bottoms = clothes.filter(c => c.category === '하의');
    const outers = clothes.filter(c => c.category === '아우터');
    setRecommendation({
      top: tops[Math.floor(Math.random() * tops.length)],
      bottom: bottoms[Math.floor(Math.random() * bottoms.length)],
      outer: outers[Math.floor(Math.random() * outers.length)],
    });
  };

  const filteredClothes = filter === '전체' ? clothes : clothes.filter(item => item.category === filter);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>👗 AI Smart Closet</h1>
        <p style={styles.subtitle}>오늘 당신에게 가장 잘 어울리는 옷을 찾아드려요.</p>
      </header>

      {/* 날씨 + 추천 대시보드 */}
      <div style={styles.dashboard}>
        <div style={styles.card}>
          <div style={{ fontSize: '36px' }}>{weatherLoading ? '⏳' : weather.emoji}</div>
          <h3 style={styles.cardTitle}>오늘의 날씨 (서울)</h3>
          <p style={styles.cardContent}>
            {weatherLoading ? '불러오는 중...' : `${weather.temp}°C / ${weather.text}`}
          </p>
        </div>
        <div style={styles.cardHighlight}>
          <div style={{ fontSize: '36px' }}>✨</div>
          <h3 style={styles.cardTitle}>날씨별 추천 코디</h3>
          <p style={styles.cardContent}>
            {weather && !weatherLoading ? getOutfitTip(weather.temp) : '날씨 분석 중...'}
          </p>
        </div>
      </div>

      {/* 추천 코디 섹션 */}
      <section style={styles.recommendSection}>
        <h2 style={styles.sectionTitle}>✨ 오늘의 추천 코디</h2>
        {clothes.length > 0 ? (
          <div style={styles.myOutfitCard}>
            <p style={styles.myOutfitLabel}>👚 내 옷장에서 추천</p>
            <div style={styles.outfitRow}>
              {recommendation?.top && (
                <div style={styles.outfitItem}>
                  <img src={recommendation.top.imageUrl} alt={recommendation.top.name} style={styles.outfitImg} />
                  <span style={styles.outfitItemLabel}>{recommendation.top.name}</span>
                  <span style={styles.outfitTag}>상의</span>
                </div>
              )}
              {recommendation?.bottom && (
                <div style={styles.outfitItem}>
                  <img src={recommendation.bottom.imageUrl} alt={recommendation.bottom.name} style={styles.outfitImg} />
                  <span style={styles.outfitItemLabel}>{recommendation.bottom.name}</span>
                  <span style={styles.outfitTag}>하의</span>
                </div>
              )}
              {recommendation?.outer && (
                <div style={styles.outfitItem}>
                  <img src={recommendation.outer.imageUrl} alt={recommendation.outer.name} style={styles.outfitImg} />
                  <span style={styles.outfitItemLabel}>{recommendation.outer.name}</span>
                  <span style={styles.outfitTag}>아우터</span>
                </div>
              )}
              {!recommendation?.top && !recommendation?.bottom && !recommendation?.outer && (
                <p style={{ color: '#94A3B8' }}>상의/하의/아우터를 더 추가하면 코디를 추천해드려요!</p>
              )}
            </div>
            <button onClick={reshuffleRecommendation} style={styles.reshuffleBtn}>🔀 다시 추천받기</button>
          </div>
        ) : (
          <div>
            <p style={styles.sampleNote}>📦 옷장이 비어있어요! 아래 샘플 코디를 참고해보세요.</p>
            <div style={styles.sampleGrid}>
              {SAMPLE_OUTFITS.map(outfit => (
                <div key={outfit.id} style={styles.sampleCard}>
                  <img src={outfit.image} alt={outfit.title} style={styles.sampleImg} />
                  <div style={styles.sampleInfo}>
                    <h3 style={styles.sampleTitle}>{outfit.title}</h3>
                    <p style={styles.sampleDesc}>{outfit.description}</p>
                    <p style={styles.sampleWeather}>🌡 {outfit.weather}</p>
                    <div style={styles.tagGroup}>
                      {outfit.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 내 옷장 */}
      <main style={styles.main}>
        <div style={styles.closetHeader}>
          <h2 style={styles.sectionTitle}>👔 내 옷장</h2>
          <button onClick={() => setShowAddModal(true)} style={styles.addBtn}>+ 옷 추가</button>
        </div>
        <div style={styles.filterBar}>
          {['전체', '상의', '하의', '아우터', '신발'].map(cat => (
            <button key={cat} onClick={() => setFilter(cat)} style={{
              ...styles.filterBtn,
              backgroundColor: filter === cat ? '#4C6EF5' : 'white',
              color: filter === cat ? 'white' : '#4A5568',
              boxShadow: filter === cat ? '0 4px 12px rgba(76,110,245,0.3)' : 'none'
            }}>{cat}</button>
          ))}
        </div>
        <div style={styles.grid}>
          {filteredClothes.length > 0 ? filteredClothes.map((item) => (
            <div key={item.id} style={styles.clothesCard}>
              {item.imageUrl
                ? <img src={item.imageUrl} alt={item.name} style={styles.clothesImg} />
                : <div style={styles.icon}>{item.category === '상의' ? '👕' : item.category === '하의' ? '👖' : '👟'}</div>
              }
              <h4 style={styles.clothesName}>{item.name}</h4>
              <div style={styles.tagGroup}>
                {item.color && <span style={styles.tag}>{item.color}</span>}
                <span style={styles.tag}>{item.category}</span>
              </div>
              <button onClick={() => handleDelete(item.id)} style={styles.deleteBtn}>🗑 삭제</button>
            </div>
          )) : (
            <div style={styles.emptyState}>
              <div style={{ fontSize: '50px', marginBottom: '20px' }}>📦</div>
              <p>{filter} 카테고리에 등록된 옷이 없습니다.</p>
              <p style={{ fontSize: '14px', color: '#CBD5E0' }}>+ 옷 추가 버튼으로 옷을 등록해보세요!</p>
            </div>
          )}
        </div>
      </main>

      {/* 옷 추가 모달 */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: '20px', color: '#1E293B' }}>👕 새 옷 추가</h3>
            <input placeholder="옷 이름 (예: 화이트 셔츠)" value={newItem.name}
              onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} style={styles.input} />
            <select value={newItem.category}
              onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))} style={styles.input}>
              {['상의', '하의', '아우터', '신발'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input placeholder="색상 (예: 화이트, 블랙)" value={newItem.color}
              onChange={e => setNewItem(prev => ({ ...prev, color: e.target.value }))} style={styles.input} />
            <label style={styles.uploadLabel}>
              📷 사진 업로드
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            {previewUrl && <img src={previewUrl} alt="미리보기" style={{ width: '100%', borderRadius: '12px', marginBottom: '16px', maxHeight: '200px', objectFit: 'cover' }} />}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleAddClothes} style={styles.confirmBtn}>추가하기</button>
              <button onClick={() => { setShowAddModal(false); setPreviewUrl(''); }} style={styles.cancelBtn}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: { backgroundColor: '#F8FAFC', minHeight: '100vh', padding: '60px 20px', fontFamily: "'Pretendard', -apple-system, sans-serif" },
  header: { textAlign: 'center', marginBottom: '50px' },
  title: { fontSize: '3rem', fontWeight: '800', color: '#1E293B', letterSpacing: '-1px' },
  subtitle: { color: '#64748B', fontSize: '1.2rem', marginTop: '10px' },
  dashboard: { display: 'flex', justifyContent: 'center', gap: '24px', marginBottom: '60px', flexWrap: 'wrap' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '24px', width: '240px', textAlign: 'center', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)' },
  cardHighlight: { backgroundColor: '#EEF2FF', padding: '30px', borderRadius: '24px', width: '240px', textAlign: 'center', border: '2px solid #4C6EF5', boxShadow: '0 10px 25px -5px rgba(76,110,245,0.1)' },
  cardTitle: { fontSize: '1rem', color: '#475569', margin: '15px 0 5px 0' },
  cardContent: { fontSize: '1.1rem', fontWeight: '700', color: '#1E293B' },
  recommendSection: { maxWidth: '1100px', margin: '0 auto 60px auto' },
  sectionTitle: { fontSize: '1.5rem', fontWeight: '700', color: '#1E293B', marginBottom: '24px' },
  myOutfitCard: { backgroundColor: '#EEF2FF', borderRadius: '24px', padding: '30px', border: '2px solid #4C6EF5' },
  myOutfitLabel: { color: '#4C6EF5', fontWeight: '700', marginBottom: '20px', fontSize: '1rem' },
  outfitRow: { display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' },
  outfitItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  outfitImg: { width: '120px', height: '140px', objectFit: 'cover', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  outfitItemLabel: { fontSize: '0.9rem', fontWeight: '600', color: '#1E293B' },
  outfitTag: { backgroundColor: '#4C6EF5', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem' },
  reshuffleBtn: { backgroundColor: '#4C6EF5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  sampleNote: { color: '#94A3B8', marginBottom: '20px', fontSize: '1rem' },
  sampleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' },
  sampleCard: { backgroundColor: 'white', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  sampleImg: { width: '100%', height: '220px', objectFit: 'cover' },
  sampleInfo: { padding: '20px' },
  sampleTitle: { fontSize: '1.1rem', fontWeight: '700', color: '#1E293B', marginBottom: '8px' },
  sampleDesc: { color: '#475569', fontSize: '0.95rem', marginBottom: '8px' },
  sampleWeather: { color: '#64748B', fontSize: '0.85rem', marginBottom: '12px' },
  main: { maxWidth: '1100px', margin: '0 auto' },
  closetHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  addBtn: { backgroundColor: '#4C6EF5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '14px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem' },
  filterBar: { display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '40px', flexWrap: 'wrap' },
  filterBtn: { padding: '12px 24px', borderRadius: '16px', border: '1px solid #E2E8F0', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'all 0.2s ease' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '30px' },
  clothesCard: { backgroundColor: 'white', padding: '24px 20px', borderRadius: '24px', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' },
  clothesImg: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '16px', marginBottom: '16px' },
  icon: { fontSize: '60px', marginBottom: '20px' },
  clothesName: { fontSize: '1.1rem', color: '#1E293B', marginBottom: '12px' },
  tagGroup: { display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' },
  tag: { backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', color: '#64748B', fontWeight: '500' },
  deleteBtn: { backgroundColor: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', backgroundColor: '#FFFFFF', borderRadius: '32px', border: '2px dashed #E2E8F0', color: '#94A3B8' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '24px', padding: '40px', width: '90%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1rem', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' },
  uploadLabel: { display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '2px dashed #CBD5E0', cursor: 'pointer', color: '#64748B', fontWeight: '600', marginBottom: '16px' },
  confirmBtn: { flex: 1, backgroundColor: '#4C6EF5', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
  cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', color: '#64748B', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
};

export default App;