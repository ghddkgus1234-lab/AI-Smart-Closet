import React, { useState } from 'react';
import { login, register } from './api';

function AuthPage({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [nickname, setNickname] = useState('');
  const [keepLogin, setKeepLogin] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 아이디 유효성 검사
  const validateUsername = (id) => {
    if (id.length < 4) return '아이디는 4자 이상이어야 해요.';
    if (id.length > 20) return '아이디는 20자 이하여야 해요.';
    if (!/^[a-zA-Z0-9]+$/.test(id)) return '아이디는 영문자와 숫자만 사용할 수 있어요.';
    return '';
  };

  // 비밀번호 유효성 검사
  const validatePassword = (pw) => {
    if (pw.length < 7) return '비밀번호는 7자 이상이어야 해요.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw)) return '특수문자를 포함해야 해요.';
    if (!/[A-Za-z]/.test(pw)) return '영문자를 포함해야 해요.';
    if (!/[0-9]/.test(pw)) return '숫자를 포함해야 해요.';
    return '';
  };

  // 비밀번호 강도
  const getPasswordStrength = (pw) => {
    if (!pw) return { label: '', color: '#E2E8F0', width: '0%' };
    let score = 0;
    if (pw.length >= 7) score++;
    if (pw.length >= 10) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(pw)) score++;
    if (/[A-Za-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (score <= 2) return { label: '약함', color: '#EF4444', width: '33%' };
    if (score <= 3) return { label: '보통', color: '#F59E0B', width: '66%' };
    return { label: '강함', color: '#10B981', width: '100%' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async () => {
    setError('');

    if (!username || !password) return setError('아이디와 비밀번호를 입력해주세요.');

    if (mode === 'register') {
      const idError = validateUsername(username);
      if (idError) return setError(idError);
      if (!nickname) return setError('닉네임을 입력해주세요.');
      if (nickname.length < 2) return setError('닉네임은 2자 이상이어야 해요.');
      const pwError = validatePassword(password);
      if (pwError) return setError(pwError);
      if (password !== passwordConfirm) return setError('비밀번호가 일치하지 않아요.');
    }

    setLoading(true);
    try {
      const data = mode === 'login'
        ? await login(username, password)
        : await register(username, password, nickname);

      if (keepLogin) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('nickname', data.nickname);
      } else {
        sessionStorage.setItem('token', data.token);
        sessionStorage.setItem('nickname', data.nickname);
      }
      onLogin(data.nickname, keepLogin);
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
            onClick={() => { setMode('login'); setError(''); setPasswordConfirm(''); }}
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}
          >로그인</button>
          <button
            onClick={() => { setMode('register'); setError(''); }}
            style={{ ...styles.tab, ...(mode === 'register' ? styles.tabActive : {}) }}
          >회원가입</button>
        </div>

        {mode === 'register' && (
          <div style={styles.inputWrapper}>
            <input
              placeholder="닉네임 (2자 이상)"
              value={nickname}
              onChange={e => setNickname(e.target.value)}
              style={styles.input}
            />
          </div>
        )}

        <div style={styles.inputWrapper}>
          <input
            placeholder={mode === 'register' ? '아이디 (영문/숫자 4~20자)' : '아이디'}
            value={username}
            onChange={e => setUsername(e.target.value)}
            style={styles.input}
            type="text"
          />
          {mode === 'register' && username && (
            <p style={{ fontSize: '0.8rem', marginTop: '4px', marginBottom: 0,
              color: /^[a-zA-Z0-9]{4,20}$/.test(username) ? '#10B981' : '#EF4444' }}>
              {/^[a-zA-Z0-9]{4,20}$/.test(username) ? '✓ 사용 가능한 아이디예요' : '✗ 영문/숫자 4~20자로 입력해주세요'}
            </p>
          )}
        </div>

        <div style={styles.inputWrapper}>
          <input
            placeholder={mode === 'register' ? '비밀번호 (7자 이상, 영문+숫자+특수문자)' : '비밀번호'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={styles.input}
            type="password"
          />
          {mode === 'register' && password && (
            <div style={styles.strengthWrapper}>
              <div style={styles.strengthBar}>
                <div style={{ ...styles.strengthFill, width: strength.width, backgroundColor: strength.color }} />
              </div>
              <span style={{ ...styles.strengthLabel, color: strength.color }}>{strength.label}</span>
            </div>
          )}
        </div>

        {mode === 'register' && (
          <div style={styles.inputWrapper}>
            <input
              placeholder="비밀번호 확인"
              value={passwordConfirm}
              onChange={e => setPasswordConfirm(e.target.value)}
              style={{
                ...styles.input,
                borderColor: passwordConfirm
                  ? password === passwordConfirm ? '#10B981' : '#EF4444'
                  : '#E2E8F0'
              }}
              type="password"
            />
            {passwordConfirm && (
              <p style={{ fontSize: '0.8rem', marginTop: '4px', marginBottom: 0,
                color: password === passwordConfirm ? '#10B981' : '#EF4444' }}>
                {password === passwordConfirm ? '✓ 비밀번호가 일치해요' : '✗ 비밀번호가 일치하지 않아요'}
              </p>
            )}
          </div>
        )}

        <div style={styles.keepLoginRow}>
          <label style={styles.keepLoginLabel}>
            <input
              type="checkbox"
              checked={keepLogin}
              onChange={e => setKeepLogin(e.target.checked)}
              style={styles.checkbox}
            />
            로그인 유지
          </label>
        </div>

        {error && <p style={styles.error}>⚠️ {error}</p>}

        <button onClick={handleSubmit} style={styles.btn} disabled={loading}>
          {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>

        {mode === 'register' && (
          <div style={styles.requirements}>
            <p style={styles.reqTitle}>비밀번호 조건</p>
            <p style={{ ...styles.reqItem, color: password.length >= 7 ? '#10B981' : '#94A3B8' }}>
              {password.length >= 7 ? '✓' : '○'} 7자 이상
            </p>
            <p style={{ ...styles.reqItem, color: /[A-Za-z]/.test(password) ? '#10B981' : '#94A3B8' }}>
              {/[A-Za-z]/.test(password) ? '✓' : '○'} 영문자 포함
            </p>
            <p style={{ ...styles.reqItem, color: /[0-9]/.test(password) ? '#10B981' : '#94A3B8' }}>
              {/[0-9]/.test(password) ? '✓' : '○'} 숫자 포함
            </p>
            <p style={{ ...styles.reqItem, color: /[!@#$%^&*(),.?":{}|<>]/.test(password) ? '#10B981' : '#94A3B8' }}>
              {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? '✓' : '○'} 특수문자 포함
            </p>
          </div>
        )}
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
  inputWrapper: { width: '100%', marginBottom: '12px' },
  input: {
    width: '100%', padding: '14px', borderRadius: '12px',
    border: '1px solid #E2E8F0', fontSize: '1rem',
    boxSizing: 'border-box', outline: 'none',
  },
  strengthWrapper: { display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' },
  strengthBar: { flex: 1, height: '4px', backgroundColor: '#E2E8F0', borderRadius: '4px', overflow: 'hidden' },
  strengthFill: { height: '100%', borderRadius: '4px', transition: 'all 0.3s ease' },
  strengthLabel: { fontSize: '0.8rem', fontWeight: '600', minWidth: '24px' },
  keepLoginRow: { width: '100%', marginBottom: '12px' },
  keepLoginLabel: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '0.95rem', color: '#475569', cursor: 'pointer',
  },
  checkbox: { width: '16px', height: '16px', cursor: 'pointer', accentColor: '#4C6EF5' },
  error: { color: '#EF4444', fontSize: '0.9rem', marginBottom: '12px', alignSelf: 'flex-start' },
  btn: {
    width: '100%', padding: '14px', backgroundColor: '#4C6EF5',
    color: 'white', border: 'none', borderRadius: '14px',
    fontSize: '1rem', fontWeight: '700', cursor: 'pointer', marginTop: '8px',
  },
  requirements: {
    width: '100%', backgroundColor: '#F8FAFC', borderRadius: '12px',
    padding: '12px 16px', marginTop: '16px',
  },
  reqTitle: { fontSize: '0.85rem', fontWeight: '700', color: '#475569', margin: '0 0 8px 0' },
  reqItem: { fontSize: '0.82rem', margin: '4px 0', transition: 'color 0.2s' },
};

export default AuthPage;