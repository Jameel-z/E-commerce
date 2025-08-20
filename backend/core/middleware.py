from fastapi import Request
from pathlib import Path
import shutil
from .config import settings

async def cleanup_temp_files(request: Request, call_next):
    try:
        response = await call_next(request)
        return response
    finally:
        # Cleanup any temporary uploads
        temp_dir = Path(settings.STATIC_DIR) / "temp"
        if temp_dir.exists():
            shutil.rmtree(temp_dir)
            temp_dir.mkdir()