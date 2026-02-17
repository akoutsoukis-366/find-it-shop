import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentSettings } from '@/hooks/useContentSettings';

interface HeroSectionProps {
  content: ContentSettings;
}

const HeroSection = ({ content }: HeroSectionProps) => {
  const heroVideoUrl = content.hero_video_url || '';
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <section className="relative h-screen flex flex-col overflow-hidden pt-16">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px]" />
      </div>

      {/* Text Content */}
      <div className="container mx-auto px-4 pt-4 md:pt-6 pb-2 relative z-10 shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center space-y-2 md:space-y-3 max-w-4xl mx-auto"
        >
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            {content.hero_title_line1 && <span className="block">{content.hero_title_line1}</span>}
            {content.hero_title_line2 && <span className="block text-primary">{content.hero_title_line2}</span>}
          </h1>

          {content.hero_description && (
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl px-2">
              {content.hero_description}
            </p>
          )}

          <div className="flex flex-row gap-2 sm:gap-3 justify-center flex-wrap">
            <Link to="/products">
              <Button variant="hero" size="default" className="sm:px-6 sm:py-5 text-sm sm:text-base">
                Αγόρασε Τώρα
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="glass" size="default" className="sm:px-6 sm:py-5 text-sm sm:text-base">
                Μάθε Περισσότερα
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Hero Video Section - hidden on mobile for performance */}
      {heroVideoUrl && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, delay: 0.3 }}
          className="relative flex-1 min-h-0 w-full hidden md:flex items-center justify-center"
        >
          {/* Soft ambient glow behind video */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
          </div>

          <div className="relative max-w-3xl 2xl:max-w-4xl w-full mx-auto">
            {/* Seamless edge blending */}
            <div className="absolute -inset-1 pointer-events-none z-10" style={{
              background: `
                radial-gradient(ellipse 70% 60% at center, transparent 30%, hsl(var(--background)) 85%),
                linear-gradient(to top, hsl(var(--background)) 0%, hsl(var(--background) / 0.6) 15%, transparent 40%),
                linear-gradient(to bottom, hsl(var(--background)) 0%, hsl(var(--background) / 0.4) 10%, transparent 35%),
                linear-gradient(to left, hsl(var(--background)) 0%, transparent 20%),
                linear-gradient(to right, hsl(var(--background)) 0%, transparent 20%)
              `
            }} />

            {!videoLoaded && (
              <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
              </div>
            )}

            <video
              src={heroVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              onCanPlayThrough={() => setVideoLoaded(true)}
              className={`w-full h-auto object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
