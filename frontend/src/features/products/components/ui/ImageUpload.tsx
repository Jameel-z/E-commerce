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
    <div className={`space-y-3 ${className}`}>
      <Label>{label}</Label>

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
          className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          <div className="flex flex-col items-center justify-center pt-3 pb-3">
            <Upload className="w-6 h-6 mb-2 text-gray-500" />
            <p className="mb-1 text-xs text-gray-500">
              <span className="font-semibold">Click to upload</span>
            </p>
            <p className="text-xs text-gray-500">
              {accept.includes("image") ? "PNG, JPG or WEBP" : "Files"} (MAX.{" "}
              {maxSize}MB)
            </p>
          </div>
        </label>
      </div>

      {/* Image Previews */}
      {totalImagesCount > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            {multiple ? "Images" : "Image"} ({totalImagesCount})
          </p>

          <div className="space-y-2">
            {/* Existing Images */}
            {existingImages.map((imageUrl, index) => (
              <div
                key={`existing-${index}`}
                className="relative group border rounded-lg bg-white flex items-center p-3 max-w-md"
              >
                {/* Image Preview */}
                <div className="w-16 h-16 mr-3 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={imageUrl}
                    alt={`Existing image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium truncate">
                    Existing Image {index + 1}
                  </p>
                  <p className="text-xs text-green-600">Currently uploaded</p>
                </div>

                {/* Remove Button for Existing Images */}
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 absolute top-2 right-2 shadow-lg"
                  onClick={() => {
                    console.log("🔥 Removing existing image:", imageUrl);
                    removeExistingImage(imageUrl);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* New Files */}
            {files.map((file, index) => (
              <div
                key={`new-${index}`}
                className="relative group border rounded-lg bg-white flex items-center p-3 max-w-md"
              >
                {/* Image Preview */}
                <div className="w-16 h-16 mr-3 rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={createImagePreview(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                    onLoad={() => URL.revokeObjectURL(createImagePreview(file))}
                  />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0 space-y-1">
                  <p className="text-sm font-medium truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-blue-600">
                    New upload ({formatFileSize(file.size)})
                  </p>
                </div>

                {/* Remove Button for New Files */}
                <Button
                  type="button"
                  variant="default"
                  size="sm"
                  className="h-8 w-8 rounded-full p-0 absolute top-2 right-2 shadow-lg"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
