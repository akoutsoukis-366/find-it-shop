import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  mainImage: string;
}

const isVideoUrl = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
  return videoExtensions.some(ext => url.toLowerCase().includes(ext));
};

const ProductGallery = ({ images, productName, mainImage }: ProductGalleryProps) => {
  // Combine main image with additional images, filtering duplicates
  const allMedia = [mainImage, ...images.filter(img => img !== mainImage)].filter(Boolean);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedMedia = allMedia[selectedIndex] || mainImage;
  const isVideo = isVideoUrl(selectedMedia);

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
  };

  if (allMedia.length === 0) {
    return (
      <div className="aspect-square bg-card rounded-3xl border border-border overflow-hidden flex items-center justify-center p-12">
        <div className="text-muted-foreground">No image available</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Display */}
      <div className="relative aspect-square bg-card rounded-3xl border border-border overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent z-10 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMedia}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full flex items-center justify-center p-8"
          >
            {isVideo ? (
              <video
                src={selectedMedia}
                className="w-full h-full object-contain rounded-xl"
                controls
                autoPlay
                loop
                muted
              />
            ) : (
              <img
                src={selectedMedia}
                alt={`${productName} - View ${selectedIndex + 1}`}
                className="w-full h-full object-contain"
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
              onClick={handleNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Counter */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-full text-sm font-medium">
            {selectedIndex + 1} / {allMedia.length}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {allMedia.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {allMedia.map((media, index) => {
            const isThumbVideo = isVideoUrl(media);
            return (
              <button
                key={media}
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                  index === selectedIndex
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-border hover:border-muted-foreground'
                }`}
              >
                {isThumbVideo ? (
                  <>
                    <video
                      src={media}
                      className="w-full h-full object-cover"
                      muted
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                      <Play className="h-6 w-6 text-foreground fill-foreground" />
                    </div>
                  </>
                ) : (
                  <img
                    src={media}
                    alt={`${productName} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
