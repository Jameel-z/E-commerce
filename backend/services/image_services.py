# backend/services/image_services.py
import os
import shutil
from fastapi import UploadFile, status, HTTPException
from pathlib import Path
from core.config import settings
import logging
from typing import Optional, List, Union

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 5 * 1024 * 1024 # 5 MB
DEFAULT_PAGE_SIZE = 1000
MAX_PAGE_SIZE = 1000



class ImageService:
    @staticmethod
    async def save_product_image(file: UploadFile, product_id: int) -> str:
        """Save product image and return relative path"""
        logger.info(f"save_product_image called for product {product_id} with file: {file.filename}")
        
        # Create product directory if not exists
        product_dir = Path(settings.STATIC_DIR) / "products" / str(product_id)
        logger.info(f"Creating directory: {product_dir}")
        product_dir.mkdir(parents=True, exist_ok=True)

        # Generate safe filename
        ext = Path(file.filename).suffix.lower()
        filename = f"img_{os.urandom(4).hex()}{ext}"
        save_path = product_dir / filename
        logger.info(f"Saving file to: {save_path}")

        # Save file
        try:
            with open(save_path, "wb") as buffer:
                content = await file.read()
                logger.info(f"Read {len(content)} bytes from uploaded file")
                buffer.write(content)
                logger.info(f"Successfully saved file: {save_path}")

            return f"/products/{product_id}/{filename}"
        except Exception as e:
            # Cleanup partial file
            try:
                if save_path.exists():
                    save_path.unlink()
            except Exception:
                pass
            logger.error(f"Failed to save product image: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save image")
    
    @staticmethod
    async def save_category_image(file: UploadFile, category_id: int) -> str:
        """Save category image and return relative path"""
        category_dir = Path(settings.STATIC_DIR) / "categories" / str(category_id)
        category_dir.mkdir(parents=True, exist_ok=True)
        ext = Path(file.filename).suffix.lower()
        filename = f"img_{os.urandom(4).hex()}{ext}"
        save_path = category_dir / filename
        try:
            with open(save_path, "wb") as buffer:
                buffer.write(await file.read())
            return f"/categories/{category_id}/{filename}"
        except Exception as e:
            if save_path.exists():
                save_path.unlink()
            logger.error(f"Failed to save category image: {str(e)}")
            raise HTTPException(status_code=500, detail="Failed to save category image")

    @staticmethod
    def delete_image(relative_path: str) -> bool:
        """Delete image file"""
        full_path = Path(settings.STATIC_DIR) / relative_path.lstrip('/')
        try:
            if full_path.exists():
                full_path.unlink()
                return True
            return False
        except Exception:
            return False
        
    @staticmethod
    async def delete_product_folder(product_id: int) -> None:
        """Delete the folder containing all images for a product"""
        product_dir = Path(settings.STATIC_DIR) / "products" / str(product_id)
        if product_dir.exists():
            try:
                shutil.rmtree(product_dir)
            except Exception as e:
                logger.error(f"Failed to delete product folder {product_dir}: {str(e)}")
                raise
        else:
            logger.warning(f"Product folder {product_dir} does not exist, nothing to delete.")

    @staticmethod
    async def validate_image(file: Optional[UploadFile]) -> Optional[UploadFile]:
        """Validate image file type and size.
        returns none if file empty/none
        otherwise returns the file if valid"""
        # Handle empty/None files
        if not file or isinstance(file, str) or getattr(file, 'filename', '') == '':
            return None
        
        # Check MIME type
        if file.content_type not in ALLOWED_MIME_TYPES:
            raise HTTPException(
                status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
                detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_MIME_TYPES)}"
            )
        
        # Check file size without reading entire file
        file.file.seek(0, 2)
        file_size = file.file.tell()
        file.file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {MAX_FILE_SIZE//(1024*1024)}MB"
            )
        
        return file
    

class FileValidator:
    @staticmethod
    async def validate_single(file: Union[UploadFile, str, None]) -> Optional[UploadFile]:
        if isinstance(file, str) or file is None or getattr(file, 'filename', '') == '':
            return None
        return await ImageService.validate_image(file)

    @staticmethod
    async def validate_multiple(files: List[Union[UploadFile, str]]) -> List[UploadFile]:
        validated = []
        for file in files:
            result = await FileValidator.validate_single(file)
            if result:
                validated.append(result)
        return validated