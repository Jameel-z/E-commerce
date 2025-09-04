from urllib.parse import urljoin
from .config import settings


def generate_static_url(path: str) -> str:
    """Generate full URL for static files"""
    base_url = f"http://{settings.DOMAIN}/static/products"  # Changed to http for development
    return urljoin(base_url, path.lstrip('/'))

