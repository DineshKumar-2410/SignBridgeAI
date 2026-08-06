from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from deep_translator import GoogleTranslator

router = APIRouter()

class TranslateRequest(BaseModel):
    text: str
    source_lang: str = "auto"
    target_lang: str

@router.post("/")
async def translate_text(request: TranslateRequest):
    try:
        translator = GoogleTranslator(source=request.source_lang, target=request.target_lang)
        translated = translator.translate(request.text)
        return {"translatedText": translated}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
