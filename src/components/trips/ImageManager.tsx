import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  Move, 
  Image as ImageIcon, 
  AlertCircle,
  Check,
  Loader2
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { config } from '../../lib/config';

interface ImageManagerProps {
  tripSlug: string;
  images: string[];
  onImagesUpdate: (images: string[]) => void;
  className?: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
}

export default function ImageManager({ 
  tripSlug, 
  images, 
  onImagesUpdate,
  className = ''
}: ImageManagerProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null);

  const uploadImage = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${config.API_BASE_URL}/trips/${tripSlug}/upload_image/`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to upload image');
    }

    const result = await response.json();
    return result.image_url;
  }, [tripSlug]);

  const deleteImage = async (imageUrl: string) => {
    const response = await fetch(`${config.API_BASE_URL}/trips/${tripSlug}/delete_image/`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ image_url: imageUrl }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete image');
    }

    const result = await response.json();
    return result.images;
  };

  const reorderImages = async (newOrder: string[]) => {
    const response = await fetch(`${config.API_BASE_URL}/trips/${tripSlug}/reorder_images/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ images: newOrder }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reorder images');
    }

    const result = await response.json();
    return result.images;
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newUploads: UploadProgress[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading' as const,
    }));

    setUploadProgress(prev => [...prev, ...newUploads]);

    for (let i = 0; i < acceptedFiles.length; i++) {
      const file = acceptedFiles[i];
      const uploadIndex = uploadProgress.length + i;

      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => 
            prev.map((item, index) => 
              index === uploadIndex && item.progress < 90
                ? { ...item, progress: item.progress + 10 }
                : item
            )
          );
        }, 200);

        const imageUrl = await uploadImage(file);

        clearInterval(progressInterval);

        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === uploadIndex
              ? { ...item, progress: 100, status: 'success' as const }
              : item
          )
        );

        // Update images list
        onImagesUpdate([...images, imageUrl]);

        // Remove from progress after delay
        setTimeout(() => {
          setUploadProgress(prev => prev.filter((_, index) => index !== uploadIndex));
        }, 2000);

      } catch (error) {
        setUploadProgress(prev => 
          prev.map((item, index) => 
            index === uploadIndex
              ? { 
                  ...item, 
                  status: 'error' as const, 
                  error: error instanceof Error ? error.message : 'Upload failed'
                }
              : item
          )
        );
      }
    }
  }, [images, onImagesUpdate, uploadProgress.length, uploadImage]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: true,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  const handleDeleteImage = async (imageUrl: string) => {
    try {
      const updatedImages = await deleteImage(imageUrl);
      onImagesUpdate(updatedImages);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDraggedOverIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex !== null && draggedOverIndex !== null && draggedIndex !== draggedOverIndex) {
      const newImages = [...images];
      const draggedImage = newImages[draggedIndex];
      newImages.splice(draggedIndex, 1);
      newImages.splice(draggedOverIndex, 0, draggedImage);

      try {
        const updatedImages = await reorderImages(newImages);
        onImagesUpdate(updatedImages);
      } catch (error) {
        console.error('Failed to reorder images:', error);
        // Revert local change on error
      }
    }
    
    setDraggedIndex(null);
    setDraggedOverIndex(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${isDragActive 
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-emerald-400 dark:hover:border-emerald-500'
          }
        `}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {isDragActive ? 'Drop images here' : 'Upload Trip Images'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Drag and drop images here, or click to select files
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-500">
          Supports JPG, PNG, WebP up to 5MB each
        </p>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress.map((upload, index) => (
          <motion.div
            key={`${upload.file.name}-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border dark:border-gray-700"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {upload.file.name}
              </span>
              {upload.status === 'success' && (
                <Check className="h-5 w-5 text-green-500" />
              )}
              {upload.status === 'error' && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {upload.status === 'uploading' && (
                <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
              )}
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  upload.status === 'success' ? 'bg-green-500' :
                  upload.status === 'error' ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            
            {upload.status === 'error' && upload.error && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                {upload.error}
              </p>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Image Grid */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Trip Images ({images.length})
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((imageUrl, index) => (
              <motion.div
                key={imageUrl}
                layout
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  relative group cursor-move rounded-lg overflow-hidden border-2 transition-all
                  ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
                  ${draggedOverIndex === index ? 'border-emerald-500 shadow-lg' : 'border-transparent'}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-video relative">
                  <img 
                    src={imageUrl} 
                    alt={`Trip image ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                  
                  {/* Controls */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteImage(imageUrl);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Drag handle */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full p-1">
                      <Move className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Index indicator */}
                  <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {index + 1}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Move className="h-4 w-4" />
            Drag images to reorder them
          </p>
        </div>
      )}
    </div>
  );
}