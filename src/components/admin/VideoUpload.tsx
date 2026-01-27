import { useState, useRef } from 'react';
import { Upload, X, Loader2, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  label: string;
  description?: string;
  bucket?: string;
  folder?: string;
}

const VideoUpload = ({
  value,
  onChange,
  label,
  description,
  bucket = 'site-assets',
  folder = 'videos',
}: VideoUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a video file');
      return;
    }

    // Validate file size (max 50MB for videos)
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video must be less than 50MB');
      return;
    }

    setIsUploading(true);

    try {
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

      if (uploadError) throw uploadError;

      // Get public URL with cache-busting parameter
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Add cache-busting query param
      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`;
      onChange(urlWithCacheBust);
      toast.success('Video uploaded successfully');
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!value) return;

    try {
      const url = new URL(value);
      const pathParts = url.pathname.split('/');
      const bucketIndex = pathParts.findIndex(p => p === bucket);
      if (bucketIndex !== -1) {
        const filePath = pathParts.slice(bucketIndex + 1).join('/');
        await supabase.storage.from(bucket).remove([filePath]);
      }
      
      onChange('');
      toast.success('Video removed');
    } catch (error) {
      console.error('Remove error:', error);
      onChange('');
    }
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

      {value && !isUploading ? (
        <div className="relative group">
          <div className="relative aspect-video w-full max-w-sm rounded-lg overflow-hidden border border-border bg-card">
            <video
              src={value}
              className="w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              key={value}
            />
            <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                Replace
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
                Remove
              </Button>
            </div>
          </div>
        </div>
      ) : isUploading ? (
        <div className="relative aspect-video w-full max-w-sm rounded-lg border border-border bg-card flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative aspect-video w-full max-w-sm rounded-lg border-2 border-dashed border-border bg-card/50 hover:bg-card hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center gap-2"
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Video className="h-6 w-6 text-primary" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Click to upload video</p>
            <p className="text-xs text-muted-foreground">MP4, WebM up to 50MB</p>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default VideoUpload;
