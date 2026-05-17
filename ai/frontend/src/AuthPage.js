import React, { useState } from 'react';
import { login, register } from './api';

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');
    if (!email || !password) return setError('이메일과 비밀번호를 입력해주세요.');
    if (mode === 'register' && !nickname) return setError('닉네임을 입력해주세요.');

    setLoading(true);
    try {
      const data = mode === 'login'
        ? await login(email, password)
        : await register(email, password, nickname);

      localStorage.setItem('token', data.token);
      localStorage.setItem('nickname', data.nickname);
      onLogin(data.nickname);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.card}>
        <div style={styles.logo}>👗</div>
        <h1 style={styles.title}>AI Smart Closet</h1>
        <p style={styles.subtitle}>
          {mode === 'login' ? '로그인하고 내 옷장을 관리해요' : '가입하고 스마트 옷장을 시작해요'}
        </p>

        <div style={styles.tabRow}>
          <button
            onClick={() => { setMode('login'); setError(''); }}
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
          >로그인</button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
          >회원가입</button>
        </div>

        {mode === 'register' && (
          <input
            placeholder="닉네임"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            style={styles.input}
          />
        )}
        <input
          placeholder="이메일"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={styles.input}
          type="email"
        />
        <input
          placeholder="비밀번호"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          style={styles.input}
          type="password"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button onClick={handleSubmit} style={styles.btn} disabled={loading}>
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    minHeight: '100vh', backgroundColor: '#F8FAFC',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'Pretendard', -apple-system, sans-serif",
  },
  card: {
    backgroundColor: 'white', borderRadius: '32px', padding: '48px 40px',
    width: '90%', maxWidth: '420px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
  },
  logo: { fontSize: '56px', marginBottom: '12px' },
  title: { fontSize: '2rem', fontWeight: '800', color: '#1E293B', margin: '0 0 8px 0' },
  subtitle: { color: '#64748B', fontSize: '1rem', marginBottom: '32px', textAlign: 'center' },
  tabRow: {
    display: 'flex', width: '100%', backgroundColor: '#F1F5F9',
    borderRadius: '14px', padding: '4px', marginBottom: '24px',
  },
  tab: {
    flex: 1, padding: '10px', border: 'none', borderRadius: '10px',
    backgroundColor: 'transparent', cursor: 'pointer',
    fontWeight: '600', fontSize: '1rem', color: '#64748B',
  },
  tabActive: { backgroundColor: 'white', color: '#4C6EF5', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' },
  input: {
    width: '100%', padding: '14px', borderRadius: '12px',
    border: '1px solid #E2E8F0', fontSize: '1rem', marginBottom: '12px',
    boxSizing: 'border-box', outline: 'none',
  },
  error: { color: '#EF4444', fontSize: '0.9rem', marginBottom: '12px', alignSelf: 'flex-start' },
  btn: {
    width: '100%', padding: '14px', backgroundColor: '#4C6EF5',
    color: 'white', border: 'none', borderRadius: '14px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '8px',
  },
};

export default AuthPage;