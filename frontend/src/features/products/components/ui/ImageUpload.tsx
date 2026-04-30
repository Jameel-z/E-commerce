import React from "react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui";
import { Label } from "@/shared/components/ui";
import { Trash2, Upload } from "lucide-react"; // Add Trash2 to imports

interface ImageUploadProps {
  label: string;
  multiple?: boolean;
  files: File[];
  existingImages?: string[]; // Add this for existing image URLs
  onChange: (files: File[]) => void;
  onRemoveExisting?: (imageUrl: string) => void; // Add this for removing existing images
  accept?: string;
  maxSize?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  label,
  multiple = false,
  files,
  existingImages = [],
  onChange,
  onRemoveExisting,
  accept = "image/*",
  maxSize = 5,
  className = "",
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    const validFiles = selectedFiles.filter((file) => {
      const sizeInMB = file.size / (1024 * 1024);
      return sizeInMB <= maxSize;
    });

    if (validFiles.length !== selectedFiles.length) {
      console.warn(`Some files were too large. Max size: ${maxSize}MB`);
    }

    if (multiple) {
      onChange([...files, ...validFiles]);
    } else {
      onChange(validFiles.slice(0, 1));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    onChange(newFiles);
  };

  const removeExistingImage = (imageUrl: string) => {
    if (onRemoveExisting) {
      onRemoveExisting(imageUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const createImagePreview = (file: File) => {
    return URL.createObjectURL(file);
  };

  const totalImagesCount = existingImages.length + files.length;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <Label className="text-xs">{label}</Label>

      {/* File Input */}
      <div className="relative">
        <Input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          id={`image-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
        />
        <label
          htmlFor={`image-upload-${label.replace(/\s+/g, "-").toLowerCase()}`}
          className="flex flex-col items-center justify-center w-full h-16 border-2 border-dashed border-gray-300 rounded-md cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-gray-500" />
            <p className="text-xs text-gray-500">
              <span className="font-semibold">Click to upload</span>
              <span className="text-gray-400">
                {" "}· {accept.includes("image") ? "PNG, JPG, WEBP" : "Files"} · max {maxSize}MB
              </span>
            </p>
          </div>
        </label>
      </div>

      {/* Image Previews */}
      {totalImagesCount > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-muted-foreground">
            {multiple ? "Images" : "Image"} ({totalImagesCount})
          </p>

          <div className="space-y-1.5">
            {/* Existing Images */}
            {existingImages.map((imageUrl, index) => (
              <div
                key={`existing-${index}`}
                className="border rounded-md bg-white flex items-center p-2 gap-2"
              >
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">
                    Existing Image {index + 1}
                  </p>
                  <p className="text-[11px] text-green-600">Currently uploaded</p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2 flex items-center gap-1 flex-shrink-0"
                  onClick={() => removeExistingImage(imageUrl)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="text-[11px]">Remove</span>
                </Button>
              </div>
            ))}

            {/* New Files */}
            {files.map((file, index) => (
              <div
                key={`new-${index}`}
                className="border rounded-md bg-white flex items-center p-2 gap-2"
              >
                <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={createImagePreview(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(createImagePreview(file))}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-[11px] text-blue-600">
                    New · {formatFileSize(file.size)}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="h-7 px-2 flex items-center gap-1 flex-shrink-0"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="h-3 w-3" />
                  <span className="text-[11px]">Remove</span>
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
