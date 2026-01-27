import { useState, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Video, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaGalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  label: string;
  description?: string;
  bucket?: string;
  folder?: string;
}

const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

const MediaGalleryUpload = ({
  value = [],
  onChange,
  label,
  description,
  bucket = 'site-assets',
  folder = 'products',
}: MediaGalleryUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast.error(`${file.name}: Only images and videos are allowed`);
          continue;
        }

        // Validate file size (images: 5MB, videos: 50MB)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 5 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(`${file.name}: File too large (max ${isVideo ? '50MB' : '5MB'})`);
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
          });

        if (uploadError) {
          toast.error(`${file.name}: Upload failed`);
          console.error('Upload error:', uploadError);
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        newUrls.push(`${publicUrl}?t=${Date.now()}`);
      }

      if (newUrls.length > 0) {
        onChange([...value, ...newUrls]);
        toast.success(`${newUrls.length} file(s) uploaded`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload files');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async (index: number) => {
    const urlToRemove = value[index];
    
    try {
      // Extract file path from URL and delete from storage
      const url = new URL(urlToRemove.split('?')[0]);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === bucket);
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from(bucket).remove([filePath]);
      }
    } catch (error) {
      console.error('Remove error:', error);
    }

    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
    toast.success('Media removed');
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newValue = [...value];
    const draggedItem = newValue[draggedIndex];
    newValue.splice(draggedIndex, 1);
    newValue.splice(index, 0, draggedItem);
    onChange(newValue);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
      </div>

      {/* Media Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {value.map((url, index) => {
            const isVideo = isVideoUrl(url);
            return (
              <div
                key={url}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group aspect-square rounded-lg overflow-hidden border border-border bg-card cursor-move ${
                  draggedIndex === index ? 'opacity-50' : ''
                }`}
              >
                {isVideo ? (
                  <video
                    src={url}
                    className="w-full h-full object-cover"
                    muted
                  />
                ) : (
                  <img
                    src={url}
                    alt={`Media ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                
                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  <div className="absolute top-1 left-1 p-1 bg-background/80 rounded">
                    <GripVertical className="h-3 w-3 text-muted-foreground" />
                  </div>
                  {isVideo && (
                    <div className="absolute top-1 right-8 p-1 bg-primary/80 rounded">
                      <Video className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Index badge */}
                <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-background/80 rounded text-xs font-medium">
                  {index + 1}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Button */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`relative rounded-lg border-2 border-dashed border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors cursor-pointer p-4 flex flex-col items-center justify-center gap-2 ${
          isUploading ? 'pointer-events-none' : ''
        }`}
      >
        {isUploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              <Video className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Add Images or Videos</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB • MP4, WebM up to 50MB</p>
            </div>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-muted-foreground">
        Drag items to reorder. First item is the main image.
      </p>
    </div>
  );
};

export default MediaGalleryUpload;
