from io import BytesIO

from PIL import Image, ImageOps


class OcrUnavailableError(RuntimeError):
    pass


class OcrService:
    def extract_text(self, image_bytes: bytes) -> str:
        try:
            import pytesseract
        except ImportError as exc:
            raise OcrUnavailableError("pytesseract 패키지가 설치되어 있지 않습니다.") from exc

        try:
            image = Image.open(BytesIO(image_bytes))
            image = ImageOps.exif_transpose(image)
            image = image.convert("L")
        except Exception as exc:
            raise OcrUnavailableError("이미지 파일을 읽을 수 없습니다.") from exc

        try:
            return pytesseract.image_to_string(image, lang="kor+eng").strip()
        except pytesseract.TesseractNotFoundError as exc:
            raise OcrUnavailableError("Tesseract OCR 실행 파일을 찾을 수 없습니다.") from exc
        except pytesseract.TesseractError as exc:
            raise OcrUnavailableError(f"OCR 처리 중 오류가 발생했습니다: {exc}") from exc