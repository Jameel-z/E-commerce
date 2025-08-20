import shutil
from fastapi import UploadFile, HTTPException
from pathlib import Path
from typing import Optional, Tuple
import uuid
from PIL import Image
import io
import logging
# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Constants
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
IMAGE_BASE_DIR = Path("static/products")
THUMBNAIL_SIZE = (300, 300)  # Width, Height for thumbnails

class ImageStorage:
    @staticmethod
    async def validate_image(file: UploadFile) -> Tuple[bool, str]:
        """Validate image file before processing"""
        try:
            # Check file extension
            ext = Path(file.filename).suffix.lower()
            if ext not in ALLOWED_EXTENSIONS:
                return False, f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            
            # Check file size
            file.file.seek(0, 2)  # Seek to end
            file_size = file.file.tell()
            file.file.seek(0)  # Reset pointer
            if file_size > MAX_FILE_SIZE:
                return False, f"File too large. Max size: {MAX_FILE_SIZE//(1024*1024)}MB"
            
            # Verify image content
            content = await file.read()
            try:
                img = Image.open(io.BytesIO(content))
                img.verify()  # Verify it's a valid image
            except Exception as img_err:
                return False, f"Invalid image content: {str(img_err)}"
            
            await file.seek(0)  # Reset file pointer
            return True, "Valid image"
        
        except Exception as e:
            logger.error(f"Image validation failed: {str(e)}")
            return False, f"Validation error: {str(e)}"

    @staticmethod
    async def store_image(
        file: UploadFile, 
        product_id: int,
        create_thumbnail: bool = False
    ) -> dict:
        """
        Store product image with optional thumbnail creation
        Returns: {
            "url": str,
            "thumbnail_url": Optional[str],
            "width": int,
            "height": int,
            "size": int
        }
        """
        # Validate the image first
        is_valid, message = await ImageStorage.validate_image(file)
        if not is_valid:
            raise HTTPException(status_code=400, detail=message)
        
        # Create product directory if not exists
        product_dir = IMAGE_BASE_DIR / str(product_id)
        product_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        original_name = Path(file.filename).stem
        file_ext = Path(file.filename).suffix.lower()
        safe_name = "".join(c if c.isalnum() else "_" for c in original_name)
        unique_id = uuid.uuid4().hex[:8]
        filename = f"{safe_name}_{unique_id}{file_ext}"
        file_path = product_dir / filename
        
        # Process and save the image
        try:
            # Read image content
            content = await file.read()
            img = Image.open(io.BytesIO(content))
            
            # Save original image
            with file_path.open("wb") as buffer:
                buffer.write(content)
            
            # Create response data
            result = {
                "url": f"/static/products/{product_id}/{filename}",
                "thumbnail_url": None,
                "width": img.width,
                "height": img.height,
                "size": len(content),
                "content_type": file.content_type
            }
            
            # Create thumbnail if requested
            if create_thumbnail:
                thumb_filename = f"thumb_{unique_id}{file_ext}"
                thumb_path = product_dir / thumb_filename
                
                img.thumbnail(THUMBNAIL_SIZE)
                img.save(thumb_path)
                
                result["thumbnail_url"] = f"/static/products/{product_id}/{thumb_filename}"
            
            return result
            
        except Exception as e:
            logger.error(f"Failed to store image: {str(e)}")
            # Clean up if partial upload occurred
            if file_path.exists():
                file_path.unlink()
            raise HTTPException(
                status_code=500,
                detail=f"Failed to process image: {str(e)}"
            )

    @staticmethod
    async def delete_image(image_url: str) -> bool:
        """Delete an image file and its thumbnail if exists"""
        try:
            file_path = Path(image_url.lstrip("/"))
            
            # Delete main image
            if file_path.exists():
                file_path.unlink()
            
            # Try to delete thumbnail if exists
            if "static/products" in image_url:
                parts = image_url.split("/")
                filename = parts[-1]
                thumb_path = file_path.parent / f"thumb_{filename}"
                if thumb_path.exists():
                    thumb_path.unlink()
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete image {image_url}: {str(e)}")
            return False

    @staticmethod
    async def delete_product_folder(product_id: int) -> bool:
        """Delete entire product folder with all images"""
        try:
            product_dir = IMAGE_BASE_DIR / str(product_id)
            if product_dir.exists():
                shutil.rmtree(product_dir)
            return True
        except Exception as e:
            logger.error(f"Failed to delete product folder {product_id}: {str(e)}")
            return False

    @staticmethod
    def get_image_dimensions(image_path: str) -> Optional[Tuple[int, int]]:
        """Get dimensions of an image file"""
        try:
            with Image.open(image_path) as img:
                return img.width, img.height
        except Exception:
            return None

# Helper functions for direct usage (maintains backward compatibility)
async def store_image(file: UploadFile, product_id: int) -> str:
    """Legacy function that wraps the new storage system"""
    result = await ImageStorage.store_image(file, product_id)
    return result["url"]

async def delete_image_file(image_url: str) -> None:
    """Delete an image file (async-compatible version)"""
    await ImageStorage.delete_image(image_url)