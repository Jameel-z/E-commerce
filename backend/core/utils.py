from urllib.parse import urljoin
from .config import settings


def generate_static_url(path: str) -> str:
    """Generate full URL for static files"""
    if path.startswith("http"):
        return path
    domain = settings.DOMAIN
    scheme = "http" if "localhost" in domain else "https"
    base_url = f"{scheme}://{domain}/static/products"
    return urljoin(base_url, path.lstrip('/'))

