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
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Text Content */}
      <div className="container mx-auto px-4 pt-4 pb-2 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center space-y-3 max-w-4xl mx-auto"
        >
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground">
            {content.hero_title_line1 && <span className="block">{content.hero_title_line1}</span>}
            {content.hero_title_line2 && <span className="block text-primary">{content.hero_title_line2}</span>}
          </h1>

          {content.hero_description && (
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl">
              {content.hero_description}
            </p>
          )}

          <div className="flex flex-row gap-3 justify-center">
            <Link to="/products">
              <Button variant="hero" size="lg">
                Αγόρασε Τώρα
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="glass" size="lg">
                Μάθε Περισσότερα
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Hero Video Section */}
      {heroVideoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative flex-1 min-h-0 w-full flex items-center justify-center px-4 pb-4"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-[100px]" />
          </div>

          <div className="relative max-w-3xl 2xl:max-w-4xl w-full mx-auto overflow-hidden rounded-2xl">
            {/* Edge-blending gradients */}
            <div className="absolute inset-0 pointer-events-none z-10" style={{
              background: `
                radial-gradient(ellipse at center, transparent 40%, hsl(var(--background)) 100%),
                linear-gradient(to top, hsl(var(--background)) 0%, transparent 30%),
                linear-gradient(to bottom, hsl(var(--background)) 0%, transparent 20%),
                linear-gradient(to left, hsl(var(--background)) 0%, transparent 15%),
                linear-gradient(to right, hsl(var(--background)) 0%, transparent 15%)
              `
            }} />

            {/* Loading spinner */}
            {!videoLoaded && (
              <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
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
              style={{ maxHeight: '100%' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
