from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.harassment_analyzer import HarassmentAnalyzer
from app.ocr import OcrService, OcrUnavailableError
from app.schemas import HarassmentAnalysisResponse

app = FastAPI(
    title="Employee Support Backend",
    description="Backend APIs for employee workplace support features.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

analyzer = HarassmentAnalyzer()
ocr_service = OcrService()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post(
    "/api/employee/harassment/analyze",
    response_model=HarassmentAnalysisResponse,
)
async def analyze_workplace_harassment(
    image: UploadFile | None = File(default=None),
    message_text: str | None = Form(default=None),
) -> HarassmentAnalysisResponse:
    if image is None and not message_text:
        raise HTTPException(
            status_code=400,
            detail="image 또는 message_text 중 하나는 반드시 필요합니다.",
        )

    extracted_text = ""
    ocr_warnings: list[str] = []

    if image is not None:
        if image.content_type and not image.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="이미지 파일만 업로드할 수 있습니다.")

        image_bytes = await image.read()
        try:
            extracted_text = ocr_service.extract_text(image_bytes)
        except OcrUnavailableError as exc:
            ocr_warnings.append(str(exc))

    text_to_analyze = extracted_text.strip() or (message_text or "").strip()
    if not text_to_analyze:
        raise HTTPException(
            status_code=422,
            detail={
                "message": "분석할 텍스트를 추출하지 못했습니다.",
                "hints": [
                    "서버에 Tesseract OCR 엔진과 한국어 언어팩이 설치되어 있는지 확인하세요.",
                    "테스트 단계에서는 message_text 필드로 텍스트를 직접 전달할 수 있습니다.",
                ],
                "ocr_warnings": ocr_warnings,
            },
        )

    result = analyzer.analyze(text_to_analyze)
    result.ocr_text = extracted_text.strip() or None
    result.input_text = text_to_analyze
    result.warnings.extend(ocr_warnings)
    return result