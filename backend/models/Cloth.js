const mongoose = require('mongoose');

const clothSchema = new mongoose.Schema({
  user:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  imageUrl:  { type: String, required: true },
  category:  { type: String, enum: ['상의', '하의', '아우터', '원피스', '신발', '가방', '액세서리'], required: true },
  color:     { type: String, default: '기타' },
  styleTags: { type: [String], default: [] },
  embedding: { type: [Number], default: [] },  // AI 서버에서 추출한 벡터
  memo:      { type: String, default: '' },
}, { timestamps: true });

// 자주 쓰는 필드 인덱스
clothSchema.index({ user: 1, category: 1 });
clothSchema.index({ user: 1, color: 1 });

module.exports = mongoose.model('Cloth', clothSchema);
