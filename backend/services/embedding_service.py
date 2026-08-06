# backend/services/embedding_service.py
"""
Local, self-hosted text embeddings for semantic product search.

Runs entirely on this server via fastembed (ONNX runtime) — no external API
calls, no per-request billing. The model file (~90MB) downloads once from
Hugging Face on first use and is cached under ~/.cache/fastembed.

If the model fails to load (offline first run, disk issue, etc.) every
function here degrades to returning None, and callers fall back to plain
keyword search instead of raising.
"""

import logging
import re
import threading
from typing import Optional

_HTML_TAG_RE = re.compile(r"<[^>]+>")

logger = logging.getLogger(__name__)

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
EMBEDDING_DIM = 384  # must match models/product.py EMBEDDING_DIM

_model = None
_model_failed = False
_lock = threading.Lock()
_db_column_ready: Optional[bool] = None


def _get_model():
    """Lazily load the embedding model once per process (thread-safe)."""
    global _model, _model_failed
    if _model is not None or _model_failed:
        return _model
    with _lock:
        if _model is not None or _model_failed:
            return _model
        try:
            from fastembed import TextEmbedding
            _model = TextEmbedding(model_name=MODEL_NAME)
            logger.info(f"Loaded embedding model '{MODEL_NAME}' for semantic search")
        except Exception as e:
            _model_failed = True
            logger.warning(
                f"Semantic search disabled — embedding model failed to load: {e}"
            )
    return _model


def is_available() -> bool:
    """Whether the local embedding model loaded successfully."""
    return _get_model() is not None


def db_column_ready(db) -> bool:
    """Whether the `products.embedding` column actually exists in the database.

    The model loading above (is_available) and the database having the
    column (this function) can disagree — e.g. right after the app starts
    with pgvector not yet installed at the OS level, the model loads fine
    but the column was never created. Cached per process; restart the app
    after installing pgvector to pick up the change.
    """
    global _db_column_ready
    if _db_column_ready is not None:
        return _db_column_ready
    try:
        from sqlalchemy import text
        result = db.execute(text(
            "SELECT 1 FROM information_schema.columns "
            "WHERE table_name = 'products' AND column_name = 'embedding'"
        )).first()
        _db_column_ready = result is not None
        if not _db_column_ready:
            logger.warning(
                "products.embedding column not found — semantic search disabled "
                "until the pgvector migration runs (install the extension and "
                "restart the app)"
            )
    except Exception as e:
        logger.warning(f"Could not verify pgvector column: {e}")
        _db_column_ready = False
    return _db_column_ready


def embed(text: str) -> Optional[list[float]]:
    """Embed a single piece of text. Returns None if unavailable or text is empty."""
    if not text or not text.strip():
        return None
    model = _get_model()
    if model is None:
        return None
    try:
        vectors = list(model.embed([text]))
        return vectors[0].tolist()
    except Exception as e:
        logger.error(f"Embedding failed for text (len={len(text)}): {e}")
        return None


def build_product_text(product) -> str:
    """Assemble the text blob a product is embedded from.

    Name carries the most signal, so it's repeated to weight it slightly
    higher. Category name is included so same-category products (e.g. all
    laptops) cluster together in embedding space, which matters for vague
    intent queries ("good for editing photos") that don't share words with
    any single product. HTML tags are stripped out of the description —
    raw markup is just noise to the embedding model.
    """
    category_name = ""
    try:
        if product.category is not None:
            category_name = product.category.name or ""
    except Exception:
        pass  # category not loaded on this instance — skip rather than fail

    description = product.description or ""
    if description:
        description = _HTML_TAG_RE.sub(" ", description)

    parts = [
        product.name,
        product.name,
        category_name,
        product.brand or "",
        product.tags or "",
        product.condition or "",
        description,
    ]
    return " ".join(p.strip() for p in parts if p and p.strip())


def embed_product(product) -> Optional[list[float]]:
    """Convenience wrapper: build the product's text blob and embed it."""
    return embed(build_product_text(product))
