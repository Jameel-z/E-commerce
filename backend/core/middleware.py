from fastapi import Request
from pathlib import Path
from starlette.responses import RedirectResponse
import shutil
from .config import settings

LIVE_STATIC_BASE = "https://api.961shop.com/static"

async def static_fallback(request: Request, call_next):
    """Redirect /static/categories/* and /static/products/* requests to the live
    server when the file doesn't exist locally (images uploaded on the live server
    aren't present in the local dev tree)."""
    path = request.url.path
    if path.startswith("/static/categories/") or path.startswith("/static/products/"):
        relative = path[len("/static/"):]          # e.g. "products/13/img.webp"
        local_path = Path(settings.STATIC_DIR) / relative
        if not local_path.exists():
            return RedirectResponse(
                f"{LIVE_STATIC_BASE}/{relative}", status_code=302
            )
    return await call_next(request)


# Keep old name as alias so existing imports don't break
category_image_fallback = static_fallback

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