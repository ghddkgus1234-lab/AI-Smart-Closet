import React, { useState, useEffect, useRef } from 'react';
import AuthPage from './AuthPage';
import { getClothes, addCloth, deleteCloth } from './api';

const GEMINI_API_KEY = 'AIzaSyBI_A-SOy-AHi_pkkBSePfjYyGIZofMl1s';

// ✅ 전체 코디 추천 카드용 (항상 샘플로 표시)
const SAMPLE_OUTFITS = [
  {
    id: 1,
    title: '캐주얼 데일리룩',
    weather: '15°C 이상',
    tags: ['캐주얼', '데일리', '봄/여름'],
    items: [
      {
        label: '상의',
        name: '화이트 티셔츠',
        images: [
          'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&q=80',
          'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=300&q=80',
          'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&q=80',
        ],
      },
      {
        label: '하의',
        name: '청바지',
        images: [
          'https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&q=80',
          'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=300&q=80',
          'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=300&q=80',
        ],
      },
      {
        label: '신발',
        name: '스니커즈',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
          'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&q=80',
          'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=300&q=80',
        ],
      },
    ],
  },
  {
    id: 2,
    title: '오피스 룩',
    weather: '모든 날씨',
    tags: ['오피스', '포멀', '올시즌'],
    items: [
      {
        label: '상의',
        name: '블라우스',
        images: [
          'https://images.unsplash.com/photo-1594938298603-c8148c4b4e51?w=300&q=80',
          'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=300&q=80',
          'https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=300&q=80',
        ],
      },
      {
        label: '하의',
        name: '슬랙스',
        images: [
          'https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&q=80',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&q=80',
          'https://images.unsplash.com/photo-1559563458-527698bf5295?w=300&q=80',
        ],
      },
      {
        label: '신발',
        name: '플랫슈즈',
        images: [
          'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&q=80',
          'https://images.unsplash.com/photo-1515347619252-60a4bf4fff4f?w=300&q=80',
          'https://images.unsplash.com/photo-1555274175-6cbf6f3b137b?w=300&q=80',
        ],
      },
    ],
  },
  {
    id: 3,
    title: '스트릿 룩',
    weather: '10°C 이상',
    tags: ['스트릿', '편안함', '가을'],
    items: [
      {
        label: '아우터',
        name: '후드티',
        images: [
          'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=300&q=80',
          'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80',
          'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=300&q=80',
        ],
      },
      {
        label: '하의',
        name: '조거팬츠',
        images: [
          'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=300&q=80',
          'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300&q=80',
          'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=300&q=80',
        ],
      },
      {
        label: '신발',
        name: '운동화',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&q=80',
          'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=300&q=80',
          'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=300&q=80',
        ],
      },
    ],
  },
];

// ✅ 오늘의 추천 코디 BEST/WORST용 샘플 (옷장이 비었을 때만 사용)
const SAMPLE_ITEMS = [
  { id: 's1', title: '크롭 반팔티',   category: '상의',   images: [
    'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80',
  ], tempLabel: '더움(25°C~)',    confidence: 92.3 },
  
  { id: 's2', title: '린넨 블라우스', category: '상의',   images: [
    'https://images.unsplash.com/photo-1551163943-3f7fb896e0f4?w=400&q=80',  // 블라우스
    'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400&q=80', // 여성 상의
  ], tempLabel: '따뜻(16~24°C)', confidence: 88.7 },
  
  { id: 's3', title: '오버핏 후드티', category: '상의', images: [
  'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&q=80',
], tempLabel: '쌀쌀(9~15°C)', confidence: 85.1 },
  
  { id: 's4', title: '데님 반바지',   category: '하의',   images: [
    'https://images.unsplash.com/photo-1591195853828-11db59a44f43?w=400&q=80',
    'https://images.unsplash.com/photo-1565084888279-aca607bb7e1e?w=400&q=80',
  ], tempLabel: '더움(25°C~)',    confidence: 90.5 },
  
  { id: 's5', title: '미디 스커트',   category: '하의',   images: [
    'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400&q=80',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&q=80',
  ], tempLabel: '따뜻(16~24°C)', confidence: 87.2 },
  
  { id: 's6', title: '슬림 슬랙스',   category: '하의',   images: [
    'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&q=80',
    'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&q=80',
  ], tempLabel: '쌀쌀(9~15°C)',  confidence: 83.4 },
  
  { id: 's7', title: '린넨 가디건',   category: '아우터', images: [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&q=80',
  ], tempLabel: '따뜻(16~24°C)', confidence: 89.1 },
  
  { id: 's8', title: '데님 재킷',     category: '아우터', images: [
    'https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400&q=80',
    'https://images.unsplash.com/photo-1503342394128-c104d54dba01?w=400&q=80',
  ], tempLabel: '쌀쌀(9~15°C)',  confidence: 86.3 },
  
  { id: 's9', title: '롱 패딩', category: '아우터', images: [
  'https://images.unsplash.com/photo-1611025504703-8c143abe6996?w=400&q=80',
], tempLabel: '추움(~8°C)', confidence: 94.2 },
];
const labelEmoji = { '상의': '👕', '하의': '👖', '아우터': '🧥', '신발': '👟' };

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
  if (temp >= 5)  return '코트 + 니트 추천';
  return '두꺼운 패딩 필수!';
}

function getTempLabel(temp) {
  if (temp >= 25) return '더움(25°C~)';
  if (temp >= 16) return '따뜻(16~24°C)';
  if (temp >= 9)  return '쌀쌀(9~15°C)';
  return '추움(~8°C)';
}

// ✅ BEST/WORST 카드 이미지 — 순서대로 fallback 시도
// 내 옷장 옷(imageUrl)과 샘플(images 배열) 모두 처리
function RecommendImage({ item, style }) {
  const images = item.images
    ? item.images
    : item.imageUrl
      ? [item.imageUrl]
      : [];
  const [idx, setIdx] = useState(0);
  const [failed, setFailed] = useState(false);

  const handleError = () => {
    if (idx + 1 < images.length) setIdx(prev => prev + 1);
    else setFailed(true);
  };

  if (failed || images.length === 0) {
    return (
      <div style={{ ...style, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px' }}>
        <span style={{ fontSize: '48px' }}>
          {item.category === '상의' ? '👕' : item.category === '하의' ? '👖' : item.category === '아우터' ? '🧥' : '👟'}
        </span>
      </div>
    );
  }

  return (
    <img
      key={idx}
      src={images[idx]}
      alt={item.name || item.title}
      style={style}
      onError={handleError}
    />
  );
}

// ✅ 챗봇 컴포넌트
function Chatbot({ clothes, weather }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', text: '안녕하세요! 👗 오늘 코디 고민 있으세요? 날씨나 옷장 기반으로 추천해드릴게요!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    const closetInfo = clothes.length > 0
      ? clothes.map(c => `${c.name}(${c.category}${c.color ? '/' + c.color : ''}${c.tempLabel ? '/' + c.tempLabel : ''})`).join(', ')
      : '등록된 옷 없음';
    const weatherInfo = weather ? `현재 날씨: ${weather.temp}°C, ${weather.text}` : '날씨 정보 없음';
    const systemPrompt = `당신은 AI 스마트 옷장 코디 전문가입니다. 사용자의 옷장과 날씨 정보를 바탕으로 코디를 추천해주세요.\n현재 옷장: ${closetInfo}\n${weatherInfo}\n답변은 친근하고 간결하게 한국어로 해주세요. 이모지를 적절히 사용해주세요.`;
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: systemPrompt + '\n\n사용자: ' + userMsg }] }]
          }),
        }
      );
      const data = await res.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '죄송해요, 답변을 가져오지 못했어요.';
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ 챗봇 연결에 실패했어요.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(prev => !prev)} style={chatStyles.toggleBtn}>
        {open ? '✕' : '💬'}
      </button>
      {open && (
        <div style={chatStyles.window}>
          <div style={chatStyles.header}>
            <span>👗 코디 AI 챗봇</span>
            <button onClick={() => setOpen(false)} style={chatStyles.closeBtn}>✕</button>
          </div>
          <div style={chatStyles.messages}>
            {messages.map((msg, i) => (
              <div key={i} style={{
                ...chatStyles.bubble,
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: msg.role === 'user' ? '#4C6EF5' : '#F1F5F9',
                color: msg.role === 'user' ? 'white' : '#1E293B',
              }}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div style={{ ...chatStyles.bubble, alignSelf: 'flex-start', backgroundColor: '#F1F5F9', color: '#94A3B8' }}>
                ✍️ 답변 작성 중...
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div style={chatStyles.inputRow}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="오늘 뭐 입을까요?"
              style={chatStyles.chatInput}
            />
            <button onClick={sendMessage} style={chatStyles.sendBtn}>전송</button>
          </div>
        </div>
      )}
    </>
  );
}

const chatStyles = {
  toggleBtn: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#4C6EF5', color: 'white', border: 'none', fontSize: '24px', cursor: 'pointer', boxShadow: '0 4px 20px rgba(76,110,245,0.4)', zIndex: 999 },
  window: { position: 'fixed', bottom: '100px', right: '30px', width: '360px', height: '500px', backgroundColor: 'white', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)', display: 'flex', flexDirection: 'column', zIndex: 998, overflow: 'hidden' },
  header: { backgroundColor: '#4C6EF5', color: 'white', padding: '16px 20px', fontWeight: '700', fontSize: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  closeBtn: { background: 'none', border: 'none', color: 'white', fontSize: '16px', cursor: 'pointer' },
  messages: { flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' },
  bubble: { padding: '10px 14px', borderRadius: '16px', maxWidth: '80%', fontSize: '0.9rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' },
  inputRow: { display: 'flex', padding: '12px', borderTop: '1px solid #E2E8F0', gap: '8px' },
  chatInput: { flex: 1, padding: '10px 14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '0.9rem', outline: 'none' },
  sendBtn: { backgroundColor: '#4C6EF5', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', fontWeight: '600' },
};


function App() {
  const [nickname, setNickname] = useState(localStorage.getItem('nickname') || sessionStorage.getItem('nickname') || '');
  const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token') || '');
  const [clothes, setClothes] = useState([]);
  const [clothesLoading, setClothesLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [filter, setFilter] = useState('전체');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '상의', color: '', imageUrl: '', tempLabel: '', confidence: 0 });
  const [previewUrl, setPreviewUrl] = useState('');
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  // 전체 코디 추천 카드 이미지 상태 (항상 샘플)
  const [sampleImages, setSampleImages] = useState(() => {
    const init = {};
    SAMPLE_OUTFITS.forEach(outfit => {
      init[outfit.id] = {};
      outfit.items.forEach((item, idx) => {
        init[outfit.id][idx] = item.images[Math.floor(Math.random() * item.images.length)];
      });
    });
    return init;
  });

  const reshuffleSampleImages = () => {
    setSampleImages(prev => {
      const next = {};
      SAMPLE_OUTFITS.forEach(outfit => {
        next[outfit.id] = {};
        outfit.items.forEach((item, idx) => {
          const current = prev[outfit.id][idx];
          const others = item.images.filter(img => img !== current);
          const pool = others.length > 0 ? others : item.images;
          next[outfit.id][idx] = pool[Math.floor(Math.random() * pool.length)];
        });
      });
      return next;
    });
  };

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

  // DB에서 옷 불러오기
  useEffect(() => {
    if (!token) return;
    setClothesLoading(true);
    getClothes()
      .then(data => {
        if (Array.isArray(data)) setClothes(data);
      })
      .finally(() => setClothesLoading(false));
  }, [token]);

  // ✅ BEST/WORST 계산 — 3단계 우선순위로 처리
  // 1순위: tempLabel 일치 + confidence > 0 (AI 분류된 옷)
  // 2순위: tempLabel 없는 옷 (사진 없이 추가한 옷) → BEST로 표시
  // 옷장이 비어있으면: SAMPLE_ITEMS 사용
  const getBestWorst = () => {
    if (!weather || weather.temp === '--') {
      return { best: [], worst: null, isSample: false, isUnclassified: false };
    }

    // 옷장이 비어있으면 샘플 사용
    if (clothes.length === 0) {
      const targetLabel = getTempLabel(weather.temp);
      const matched = SAMPLE_ITEMS
        .filter(c => c.tempLabel === targetLabel && c.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence);
      const unmatched = SAMPLE_ITEMS
        .filter(c => c.tempLabel && c.tempLabel !== targetLabel && c.confidence > 0)
        .sort((a, b) => b.confidence - a.confidence);
      return { best: matched.slice(0, 2), worst: unmatched[0] || null, isSample: true, isUnclassified: false };
    }

    // 옷장에 옷이 있는 경우
    const targetLabel = getTempLabel(weather.temp);

    // 1순위: AI 분류된 옷 중 날씨 일치
    const classified = clothes.filter(c => c.tempLabel && c.confidence > 0);
    const matched = classified
      .filter(c => c.tempLabel === targetLabel)
      .sort((a, b) => b.confidence - a.confidence);

    // WORST: AI 분류된 옷 중 날씨 불일치
    const unmatched = classified
      .filter(c => c.tempLabel !== targetLabel)
      .sort((a, b) => b.confidence - a.confidence);

    if (matched.length > 0) {
      // AI 분류된 날씨 맞는 옷이 있으면 그걸로 표시
      return { best: matched.slice(0, 2), worst: unmatched[0] || null, isSample: false, isUnclassified: false };
    }

    // 2순위: AI 분류 없는 옷들 (사진 없이 추가한 옷)
    const unclassified = clothes.filter(c => !c.tempLabel || c.confidence === 0);
    if (unclassified.length > 0) {
      return { best: unclassified.slice(0, 2), worst: unmatched[0] || null, isSample: false, isUnclassified: true };
    }

    // 분류된 옷은 있지만 오늘 날씨에 맞는 게 없는 경우
    return { best: [], worst: unmatched[0] || null, isSample: false, isUnclassified: false };
  };

  const { best, worst, isSample, isUnclassified } = getBestWorst();

  const handleLogin = (nick, keepLogin) => {
    setNickname(nick);
    setToken(keepLogin
      ? localStorage.getItem('token')
      : sessionStorage.getItem('token')
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('nickname');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('nickname');
    setToken('');
    setNickname('');
  };
  const handleCategoryChange = (e) => {
    setNewItem(prev => ({ ...prev, category: e.target.value, tempLabel: '', confidence: 0 }));
    setAiResult(null);
  };
  const handleImageUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 미리보기
  const reader = new FileReader();
  reader.onloadend = () => {
  setPreviewUrl(reader.result);
  setNewItem(prev => ({ ...prev, imageUrl: reader.result, file: file })); // file 추가
};
  reader.readAsDataURL(file);

  const categoryToEndpoint = { '상의': 'top', '하의': 'bottoms', '아우터': 'outer' };
  const endpoint = categoryToEndpoint[newItem.category];
  if (!endpoint) return;

  setAiLoading(true);
  setAiResult(null);

  try {
    // FormData로 파일 직접 업로드
    const formData = new FormData();
    formData.append('files', file);

    // 1단계: 파일 업로드
    const uploadRes = await fetch('https://jangso-smart-closet-ai.hf.space/gradio_api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!uploadRes.ok) throw new Error('업로드 실패');
    const uploadedPaths = await uploadRes.json();
    const filePath = uploadedPaths[0];

    // 2단계: 예측 요청
    const res = await fetch('https://jangso-smart-closet-ai.hf.space/gradio_api/call/gradio_predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: [{ path: filePath }, newItem.category]
      }),
    });
    if (!res.ok) throw new Error('서버 오류');
    const { event_id } = await res.json();

    // 3단계: 결과 가져오기
    const resultRes = await fetch(
      `https://jangso-smart-closet-ai.hf.space/gradio_api/call/gradio_predict/${event_id}`
    );
    const text = await resultRes.text();
    const dataLine = text.split('\n').find(line => line.startsWith('data:'));
    const json = JSON.parse(dataLine.replace('data: ', ''));
    const labelStr = json[0];
    console.log('labelStr:', labelStr);  // ← 이거 추가
    console.log('json:', json);
    const allProbs = json[1] || {};
    const label = labelStr.replace(/\s+\(\d+\.?\d*%\)$/, '');
    const confidence = parseFloat(labelStr.match(/\((\d+\.?\d*)%\)/)?.[1] || '0');

    setAiResult({ label, confidence, all_probs: allProbs });
    setNewItem(prev => ({ ...prev, tempLabel: label, confidence }));
  } catch (err) {
    setAiResult({ error: 'AI 서버에 연결할 수 없습니다.' });
  } finally {
    setAiLoading(false);
  }
};
const handleAddClothes = async () => {
  if (!newItem.name) return alert('이름을 입력해주세요!');

  try {
    const formData = new FormData();
    formData.append('category', newItem.category);
    formData.append('color', newItem.color || '기타');
    formData.append('styleTags', JSON.stringify([]));
    formData.append('memo', '');

    // 이미지 파일이 있으면 추가
    if (newItem.file) {
      formData.append('image', newItem.file);
    } else if (newItem.imageUrl) {
      // base64를 blob으로 변환
      const res = await fetch(newItem.imageUrl);
      const blob = await res.blob();
      formData.append('image', blob, `${newItem.name}.jpg`);
    }

    const saved = await addCloth(formData);
    // DB에서 저장된 데이터에 name, tempLabel, confidence 추가
    setClothes(prev => [...prev, {
      ...saved,
      name: newItem.name,
      tempLabel: newItem.tempLabel,
      confidence: newItem.confidence,
      imageUrl: saved.image_url || newItem.imageUrl,
    }]);
  } catch (err) {
    alert('옷 저장에 실패했어요: ' + err.message);
    return;
  }

  setNewItem({ name: '', category: '상의', color: '', imageUrl: '', tempLabel: '', confidence: 0 });
  setPreviewUrl('');
  setAiResult(null);
  setShowAddModal(false);
};

const handleDelete = async (id) => {
  try {
    await deleteCloth(id);
    setClothes(prev => prev.filter(c => c.id !== id));
  } catch (err) {
    alert('삭제에 실패했어요: ' + err.message);
  }
};

  if (!token) return <AuthPage onLogin={handleLogin} />;

  const filteredClothes = filter === '전체' ? clothes : clothes.filter(item => item.category === filter);

  // 안내 메시지 결정
  const recommendNote = isSample
    ? '📦 옷장이 비어있어요! 샘플 아이템으로 추천해드릴게요.'
    : isUnclassified
      ? '📷 AI 분류 정보가 없는 옷이에요. 사진을 업로드하면 날씨별 정확한 추천을 받을 수 있어요!'
      : '👚 내 옷장 기반으로 오늘 날씨에 맞는 코디를 추천해드려요!';

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <header style={styles.header}>
        <h1 style={styles.title}>👗 AI Smart Closet</h1>
        <p style={styles.subtitle}>오늘 당신에게 가장 잘 어울리는 옷을 찾아드려요.</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '12px' }}>
          <span style={{ color: '#4C6EF5', fontWeight: '700' }}>👤 {nickname}님</span>
          <button onClick={handleLogout} style={{ backgroundColor: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontWeight: '600' }}>로그아웃</button>
        </div>
      </header>

      {/* 날씨 대시보드 */}
      <div style={styles.dashboard}>
        <div style={styles.card}>
          <div style={{ fontSize: '36px' }}>{weatherLoading ? '⏳' : weather.emoji}</div>
          <h3 style={styles.cardTitle}>오늘의 날씨 (서울)</h3>
          <p style={styles.cardContent}>{weatherLoading ? '불러오는 중...' : `${weather.temp}°C / ${weather.text}`}</p>
        </div>
        <div style={styles.cardHighlight}>
          <div style={{ fontSize: '36px' }}>✨</div>
          <h3 style={styles.cardTitle}>날씨별 추천 코디</h3>
          <p style={styles.cardContent}>{weather && !weatherLoading ? getOutfitTip(weather.temp) : '날씨 분석 중...'}</p>
        </div>
      </div>

      {/* ✅ 오늘의 추천 코디 — BEST/WORST */}
      <section style={styles.recommendSection}>
        <h2 style={styles.sectionTitle}>✨ 오늘의 추천 코디</h2>
        <p style={styles.sampleNote}>{recommendNote}</p>
        <div style={styles.bestWorstRow}>
          {best.length > 0 ? best.map((item, idx) => (
            <div key={item.id} style={styles.bestCard}>
              <div style={styles.bestBadge}>
                🏆 BEST {idx + 1}{isSample ? ' (샘플)' : isUnclassified ? ' (미분류)' : ''}
              </div>
              <RecommendImage item={item} style={styles.recommendImg} />
              <p style={styles.recommendName}>{item.name || item.title}</p>
              <p style={styles.recommendCategory}>{item.category}</p>
              {item.confidence > 0 ? (
                <>
                  <div style={styles.confidenceBar}>
                    <div style={{ ...styles.confidenceFill, width: `${item.confidence}%`, backgroundColor: '#4C6EF5' }} />
                  </div>
                  <p style={styles.confidenceText}>AI 확신도 {Number(item.confidence).toFixed(1)}%</p>
                  <span style={styles.tempTagGreen}>🌡 {item.tempLabel}</span>
                </>
              ) : (
                <p style={{ color: '#94A3B8', fontSize: '0.82rem', marginTop: '8px' }}>
                  📷 사진 업로드 시 AI 분류 가능
                </p>
              )}
            </div>
          )) : (
            <div style={styles.emptyRecommend}>
              <p>😅 오늘 날씨에 맞는 옷이 없어요!</p>
              <p style={{ fontSize: '0.9rem', color: '#94A3B8' }}>
                {clothes.length > 0 ? '사진을 업로드해서 AI 분류를 받아보세요.' : '옷을 추가해보세요.'}
              </p>
            </div>
          )}
          {worst && (
            <div style={styles.worstCard}>
              <div style={styles.worstBadge}>❌ WORST{isSample ? ' (샘플)' : ''}</div>
              <RecommendImage item={worst} style={styles.recommendImg} />
              <p style={styles.recommendName}>{worst.name || worst.title}</p>
              <p style={styles.recommendCategory}>{worst.category}</p>
              <div style={styles.confidenceBar}>
                <div style={{ ...styles.confidenceFill, width: `${worst.confidence}%`, backgroundColor: '#EF4444' }} />
              </div>
              <p style={styles.confidenceText}>AI 확신도 {Number(worst.confidence).toFixed(1)}%</p>
              <span style={styles.tempTagRed}>🌡 {worst.tempLabel}</span>
              <p style={styles.worstMsg}>오늘 날씨엔 비추천 🙅</p>
            </div>
          )}
        </div>
      </section>

      {/* ✅ 전체 코디 추천 — 항상 샘플 카드 */}
      <section style={styles.outfitSection}>
        <h2 style={styles.sectionTitle}>👔 전체 코디 추천</h2>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>오늘 입기 좋은 스타일을 참고해보세요.</p>
          <button onClick={reshuffleSampleImages} style={styles.reshuffleSampleBtn}>🔀 이미지 바꾸기</button>
        </div>
        <div style={styles.sampleGrid}>
          {SAMPLE_OUTFITS.map(outfit => (
            <div key={outfit.id} style={styles.sampleCard}>
              <div style={styles.sampleCardHeader}>
                <h3 style={styles.sampleTitle}>{outfit.title}</h3>
                <span style={styles.sampleWeatherBadge}>🌡 {outfit.weather}</span>
              </div>
              <div style={styles.sampleItemRow}>
                {outfit.items.map((item, idx) => (
                  <div key={idx} style={styles.sampleItemCol}>
                    <div style={styles.sampleImgWrap}>
                      <img
                        src={sampleImages[outfit.id]?.[idx]}
                        alt={item.name}
                        style={styles.sampleItemImg}
                        onError={e => {
                          const fallbacks = item.images.filter(img => img !== e.target.src);
                          if (fallbacks.length > 0) e.target.src = fallbacks[0];
                        }}
                      />
                      <span style={styles.sampleItemBadge}>
                        {labelEmoji[item.label]} {item.label}
                      </span>
                    </div>
                    <p style={styles.sampleItemName}>{item.name}</p>
                  </div>
                ))}
              </div>
              <div style={styles.tagGroup}>
                {outfit.tags.map(tag => <span key={tag} style={styles.tag}>{tag}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 내 옷장 */}
      <main style={styles.main}>
        <div style={styles.closetHeader}>
          <h2 style={styles.sectionTitle}>🗂 내 옷장</h2>
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
                {item.tempLabel && <span style={styles.tempTag}>🌡 {item.tempLabel}</span>}
                {item.confidence > 0 && <span style={styles.tag}>{Number(item.confidence).toFixed(1)}%</span>}
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
            <select value={newItem.category} onChange={handleCategoryChange} style={styles.input}>
              {['상의', '하의', '아우터', '신발'].map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input placeholder="색상 (예: 화이트, 블랙)" value={newItem.color}
              onChange={e => setNewItem(prev => ({ ...prev, color: e.target.value }))} style={styles.input} />
            <label style={styles.uploadLabel}>
              📷 사진 업로드 {['상의', '하의', '아우터'].includes(newItem.category) ? '(업로드 시 AI 자동 분류)' : ''}
              <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
            </label>
            {previewUrl && (
              <img src={previewUrl} alt="미리보기" style={{ width: '100%', borderRadius: '12px', marginBottom: '16px', maxHeight: '200px', objectFit: 'cover' }} />
            )}
            {aiLoading && (
              <p style={{ textAlign: 'center', color: '#4C6EF5', marginBottom: '12px', fontWeight: '600' }}>🤖 AI 분석 중...</p>
            )}
            {aiResult && !aiResult.error && (
              <div style={styles.aiResultBox}>
                <p style={styles.aiResultTitle}>
                  🌡 AI 추천 온도 구간: <span style={{ color: '#4C6EF5' }}>{aiResult.label}</span>
                  <span style={styles.aiConfidence}>({aiResult.confidence}%)</span>
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  {Object.entries(aiResult.all_probs).map(([label, prob]) => (
                    <span key={label} style={{
                      backgroundColor: label === aiResult.label ? '#4C6EF5' : '#F1F5F9',
                      color: label === aiResult.label ? 'white' : '#64748B',
                      padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '500',
                    }}>
                      {label}: {prob}%
                    </span>
                  ))}
                </div>
              </div>
            )}
            {aiResult?.error && (
              <p style={{ color: '#EF4444', fontSize: '0.85rem', marginBottom: '12px' }}>⚠️ {aiResult.error}</p>
            )}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleAddClothes} style={styles.confirmBtn}>추가하기</button>
              <button onClick={() => { setShowAddModal(false); setPreviewUrl(''); setAiResult(null); }} style={styles.cancelBtn}>취소</button>
            </div>
          </div>
        </div>
      )}

      <Chatbot clothes={clothes} weather={weather} />
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
  sampleNote: { color: '#94A3B8', marginBottom: '20px', fontSize: '1rem' },
  bestWorstRow: { display: 'flex', gap: '24px', flexWrap: 'wrap' },
  bestCard: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(76,110,245,0.15)', border: '2px solid #4C6EF5', flex: '1', minWidth: '200px', maxWidth: '260px', position: 'relative' },
  worstCard: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', textAlign: 'center', boxShadow: '0 4px 20px rgba(239,68,68,0.15)', border: '2px solid #EF4444', flex: '1', minWidth: '200px', maxWidth: '260px', position: 'relative' },
  bestBadge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#4C6EF5', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap' },
  worstBadge: { position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', backgroundColor: '#EF4444', color: 'white', padding: '4px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '700', whiteSpace: 'nowrap' },
  recommendImg: { width: '100%', height: '160px', objectFit: 'cover', borderRadius: '16px', marginBottom: '12px', marginTop: '8px' },
  recommendName: { fontWeight: '700', color: '#1E293B', fontSize: '1rem', marginBottom: '4px' },
  recommendCategory: { color: '#64748B', fontSize: '0.85rem', marginBottom: '10px' },
  confidenceBar: { width: '100%', height: '8px', backgroundColor: '#F1F5F9', borderRadius: '4px', marginBottom: '6px', overflow: 'hidden' },
  confidenceFill: { height: '100%', borderRadius: '4px', transition: 'width 0.5s ease' },
  confidenceText: { fontSize: '0.8rem', color: '#64748B', marginBottom: '8px' },
  tempTagGreen: { backgroundColor: '#ECFDF5', color: '#059669', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600' },
  tempTagRed: { backgroundColor: '#FEF2F2', color: '#EF4444', padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: '600' },
  worstMsg: { color: '#EF4444', fontSize: '0.85rem', marginTop: '8px', fontWeight: '600' },
  emptyRecommend: { textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '24px', color: '#64748B', border: '2px dashed #E2E8F0' },
  outfitSection: { maxWidth: '1200px', margin: '0 auto 60px auto' },
  reshuffleSampleBtn: { backgroundColor: 'white', color: '#4C6EF5', border: '2px solid #4C6EF5', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '0.95rem', whiteSpace: 'nowrap' },
  sampleGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '28px' },
  sampleCard: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px' },
  sampleCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  sampleTitle: { fontSize: '1.15rem', fontWeight: '700', color: '#1E293B', margin: 0 },
  sampleWeatherBadge: { backgroundColor: '#EEF2FF', color: '#4C6EF5', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', whiteSpace: 'nowrap' },
  sampleItemRow: { display: 'flex', gap: '10px' },
  sampleItemCol: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  sampleImgWrap: { position: 'relative', width: '100%' },
  sampleItemImg: { width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: '14px', display: 'block' },
  sampleItemBadge: { position: 'absolute', bottom: '6px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(0,0,0,0.55)', color: 'white', padding: '2px 8px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: '600', whiteSpace: 'nowrap' },
  sampleItemName: { fontSize: '0.82rem', color: '#475569', fontWeight: '600', margin: 0, textAlign: 'center' },
  tagGroup: { display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' },
  tag: { backgroundColor: '#F1F5F9', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', color: '#64748B', fontWeight: '500' },
  tempTag: { backgroundColor: '#ECFDF5', color: '#059669', padding: '6px 12px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: '600' },
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
  deleteBtn: { backgroundColor: '#FEE2E2', color: '#EF4444', border: 'none', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' },
  emptyState: { gridColumn: '1 / -1', textAlign: 'center', padding: '80px 20px', backgroundColor: '#FFFFFF', borderRadius: '32px', border: '2px dashed #E2E8F0', color: '#94A3B8' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal: { backgroundColor: 'white', borderRadius: '24px', padding: '40px', width: '90%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto' },
  input: { width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #E2E8F0', fontSize: '1rem', marginBottom: '16px', boxSizing: 'border-box', outline: 'none' },
  uploadLabel: { display: 'block', textAlign: 'center', padding: '14px', borderRadius: '12px', border: '2px dashed #CBD5E0', cursor: 'pointer', color: '#64748B', fontWeight: '600', marginBottom: '16px' },
  confirmBtn: { flex: 1, backgroundColor: '#4C6EF5', color: 'white', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
  cancelBtn: { flex: 1, backgroundColor: '#F1F5F9', color: '#64748B', border: 'none', padding: '14px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '1rem' },
  aiResultBox: { backgroundColor: '#EEF2FF', borderRadius: '12px', padding: '14px 18px', marginBottom: '16px', border: '1.5px solid #4C6EF5' },
  aiResultTitle: { margin: 0, fontWeight: '700', color: '#1E293B', fontSize: '0.95rem' },
  aiConfidence: { color: '#94A3B8', fontWeight: '400', marginLeft: '8px' },
};

export default App;