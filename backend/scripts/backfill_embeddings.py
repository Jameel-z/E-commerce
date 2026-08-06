"""
One-off script: compute embeddings for products.

By default, only embeds products that don't have one yet (existing products
created before semantic search was added — new products get embedded
automatically on create/update). Pass --force to re-embed every product
regardless of current state — use this after changing how product text is
built (see embedding_service.build_product_text), since existing embeddings
were computed from the old text and won't reflect the change otherwise.

Usage (from backend/):
    venv/bin/python -m scripts.backfill_embeddings
    venv/bin/python -m scripts.backfill_embeddings --force
"""

import argparse
import logging
import sys
from pathlib import Path

# Allow running as `python -m scripts.backfill_embeddings` from backend/
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy.orm import joinedload

from database import SessionLocal
from models.product import Product
from services import embedding_service

logging.basicConfig(level=logging.INFO, format="%(message)s")
logger = logging.getLogger(__name__)


def run(force: bool = False):
    if not embedding_service.is_available():
        logger.error(
            "Embedding model unavailable — check that fastembed is installed "
            "and this machine can reach huggingface.co on first run (the "
            "model downloads once and is cached locally after that)."
        )
        return

    db = SessionLocal()
    try:
        query = db.query(Product).options(joinedload(Product.category))
        if not force:
            query = query.filter(Product.embedding.is_(None))
        products = query.all()

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
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--force",
        action="store_true",
        help="Re-embed every product, not just ones missing an embedding",
    )
    args = parser.parse_args()
    run(force=args.force)
