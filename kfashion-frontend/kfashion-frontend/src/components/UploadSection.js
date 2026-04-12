import React, { useRef } from 'react';
import './UploadSection.css';

export default function UploadSection({ preview, onFileChange, onAnalyze, analyzing, hasFile, weatherReady }) {
  const inputRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) onFileChange(file);
  };

  return (
    <div className="upload-card">
      <h3 className="section-title">📸 옷 이미지 업로드</h3>
      <div
        className={`drop-zone ${preview ? 'has-preview' : ''}`}
        onClick={() => inputRef.current.click()}
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
      >
        {preview ? (
          <img src={preview} alt="preview" className="preview-img" />
        ) : (
          <div className="drop-hint">
            <span className="drop-icon">📁</span>
            <p>클릭하거나 이미지를 끌어다 놓으세요</p>
            <small>JPG, PNG 지원</small>
          </div>
        )}
      </div>
      <input
        ref={inputRef} type="file" accept="image/*"
        style={{ display:'none' }}
        onChange={e => e.target.files[0] && onFileChange(e.target.files[0])}
      />
      {preview && (
        <button
          className="reset-btn"
          onClick={() => { inputRef.current.value=''; onFileChange(null); }}
        >↩ 다른 이미지 선택</button>
      )}
      <button
        className={`analyze-btn ${analyzing ? 'loading' : ''}`}
        onClick={onAnalyze}
        disabled={!hasFile || analyzing || !weatherReady}
      >
        {analyzing
          ? <><span className="btn-spinner" /> AI 분석 중...</>
          : !weatherReady
            ? '날씨 정보를 먼저 불러오세요'
            : '🤖 AI 분석 시작'
        }
      </button>
    </div>
  );
}
