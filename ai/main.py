"""
Smart Closet AI - FastAPI 서버
EfficientNet-B0 기반 상의/하의/아우터 온도 구간 분류 모델 3개를 서빙합니다.

실행 방법:
  pip install fastapi uvicorn torch torchvision pillow python-multipart
  uvicorn main:app --reload --port 8000

.pth 파일 위치: 이 main.py와 같은 폴더에 아래 3개 파일을 넣어주세요
  - best_top_model.pth
  - best_bottoms_model.pth
  - best_outer_model.pth
"""

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn.functional as F
import torchvision.transforms as transforms
from torchvision.models import efficientnet_b0
from PIL import Image
import io

app = FastAPI(title="Smart Closet AI Server")

# ── CORS 설정 (React 개발 서버 허용) ─────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 클래스 라벨 정의 ─────────────────────────────────────────────────────
# 학습 시 ImageFolder 기준 알파벳 순 정렬: 더움(0) / 따뜻(1) / 쌀쌀_추움(2)
# ※ 실제 학습 코드의 dataset.classes 순서와 반드시 일치시켜 주세요!
TOP_CLASSES     = ["더움(25°C~)", "따뜻(16~24°C)", "쌀쌀(9~15°C)"]
BOTTOMS_CLASSES = ["더움(25°C~)", "따뜻(16~24°C)", "쌀쌀(9~15°C)"]
OUTER_CLASSES   = ["더움(25°C~)", "따뜻(16~24°C)", "쌀쌀·추움(~15°C)"]

# ── 이미지 전처리 (EfficientNet-B0 표준) ─────────────────────────────────
transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406],
                         std=[0.229, 0.224, 0.225]),
])

# ── 모델 로드 헬퍼 ────────────────────────────────────────────────────────
def load_model(path: str, num_classes: int):
    model = efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(
        model.classifier[1].in_features, num_classes
    )
    state_dict = torch.load(path, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()
    return model

# 서버 시작 시 3개 모델 한 번만 로드
print("모델 로딩 중...")
top_model     = load_model("best_top_model.pth",     len(TOP_CLASSES))
bottoms_model = load_model("best_bottoms_model.pth", len(BOTTOMS_CLASSES))
outer_model   = load_model("best_outer_model.pth",   len(OUTER_CLASSES))
print("모델 로딩 완료 ✅")


# ── 공통 예측 함수 ────────────────────────────────────────────────────────
def predict(model, class_names: list, image_bytes: bytes) -> dict:
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(img).unsqueeze(0)          # (1, 3, 224, 224)

    with torch.no_grad():
        logits = model(tensor)                    # (1, num_classes)
        probs  = F.softmax(logits, dim=1)[0]      # (num_classes,)
        pred   = probs.argmax().item()

    return {
        "label":      class_names[pred],
        "confidence": round(probs[pred].item() * 100, 1),
        "all_probs":  {
            class_names[i]: round(probs[i].item() * 100, 1)
            for i in range(len(class_names))
        },
    }


# ── API 엔드포인트 ────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"status": "ok", "message": "Smart Closet AI 서버 정상 작동 중 🎽"}


@app.post("/predict/top")
async def predict_top(file: UploadFile = File(...)):
    """상의 이미지 → 온도 구간 예측"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    data = await file.read()
    result = predict(top_model, TOP_CLASSES, data)
    return {"category": "상의", **result}


@app.post("/predict/bottoms")
async def predict_bottoms(file: UploadFile = File(...)):
    """하의 이미지 → 온도 구간 예측"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    data = await file.read()
    result = predict(bottoms_model, BOTTOMS_CLASSES, data)
    return {"category": "하의", **result}


@app.post("/predict/outer")
async def predict_outer(file: UploadFile = File(...)):
    """아우터 이미지 → 온도 구간 예측"""
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")
    data = await file.read()
    result = predict(outer_model, OUTER_CLASSES, data)
    return {"category": "아우터", **result}


@app.post("/predict/auto")
async def predict_auto(file: UploadFile = File(...), category: str = "상의"):
    """
    category 파라미터로 모델 선택 (상의 / 하의 / 아우터)
    React에서 카테고리 선택 후 한 번에 호출할 때 사용
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="이미지 파일만 업로드 가능합니다.")

    model_map = {
        "상의":   (top_model,     TOP_CLASSES),
        "하의":   (bottoms_model, BOTTOMS_CLASSES),
        "아우터": (outer_model,   OUTER_CLASSES),
    }
    if category not in model_map:
        raise HTTPException(status_code=400, detail=f"category는 '상의', '하의', '아우터' 중 하나여야 합니다. (받은 값: {category})")

    model, classes = model_map[category]
    data = await file.read()
    result = predict(model, classes, data)
    return {"category": category, **result}
