"""
One-off script: compute embeddings for every product that doesn't have one
yet (existing products created before semantic search was added).

New products get embedded automatically on create/update — this is only
needed once, right after the pgvector migration runs for the first time.

Usage (from backend/):
    venv/bin/python -m scripts.backfill_embeddings
"""

import logging
import sys
from pathlib import Path

# Allow running as `python -m scripts.backfill_embeddings` from backend/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from database import SessionLocal
from models.product import Product
from services import embedding_service

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def run():
    if not embedding_service.is_available():
        logger.error(
            "Embedding model unavailable — check that fastembed is installed "
            "and this machine can reach huggingface.co on first run (the "
            "model downloads once and is cached locally after that)."
        )
        return

    db = SessionLocal()
    try:
        products = db.query(Product).filter(Product.embedding.is_(None)).all()
        total = len(products)
        if total == 0:
            logger.info("Nothing to do — every product already has an embedding.")
            return

        logger.info(f"Embedding {total} product(s)...")
        done = 0
        failed = 0
        for product in products:
            vector = embedding_service.embed_product(product)
            if vector is None:
                failed += 1
                logger.warning(f"  skipped product {product.id} ({product.name!r}) — empty text or embed error")
                continue
            product.embedding = vector
            done += 1
            if done % 25 == 0:
                db.commit()
                logger.info(f"  ...{done}/{total}")

        db.commit()
        logger.info(f"Done — embedded {done} product(s), skipped {failed}.")
    finally:
        db.close()


if __name__ == "__main__":
    run()
