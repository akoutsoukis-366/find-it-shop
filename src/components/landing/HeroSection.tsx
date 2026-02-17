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
    <section className="relative min-h-screen flex flex-col overflow-hidden pt-16">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px]" />
      </div>

      {/* Text Content */}
      <div className="container mx-auto px-4 pt-12 pb-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center text-center space-y-6 max-w-4xl mx-auto"
        >
          {content.hero_badge_text && (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-muted-foreground">{content.hero_badge_text}</span>
            </div>
          )}

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground">
            {content.hero_title_line1 && <span className="block">{content.hero_title_line1}</span>}
            {content.hero_title_line2 && <span className="block text-primary">{content.hero_title_line2}</span>}
          </h1>

          {content.hero_description && (
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
              {content.hero_description}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Link to="/products">
              <Button variant="hero" size="xl">
                Αγόρασε Τώρα
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/about">
              <Button variant="glass" size="xl">
                Μάθε Περισσότερα
              </Button>
            </Link>
          </div>

          {(content.hero_stat1_value || content.hero_stat2_value || content.hero_stat3_value) && (
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-4">
              {[
                { value: content.hero_stat1_value, label: content.hero_stat1_label },
                { value: content.hero_stat2_value, label: content.hero_stat2_label },
                { value: content.hero_stat3_value, label: content.hero_stat3_label },
              ].filter(s => s.value || s.label).map((stat, i, arr) => (
                <div key={i} className="flex items-center gap-4 sm:gap-8">
                  <div className="text-center">
                    {stat.value && <div className="text-sm sm:text-base font-semibold text-foreground">{stat.value}</div>}
                    {stat.label && <div className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-wide">{stat.label}</div>}
                  </div>
                  {i < arr.length - 1 && <div className="hidden sm:block w-px h-12 bg-border" />}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Hero Video Section */}
      {heroVideoUrl && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative flex-1 w-full flex items-center justify-center px-4 pb-8"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-[100px]" />
          </div>

          <div className="relative max-w-5xl 2xl:max-w-6xl w-full mx-auto overflow-hidden rounded-2xl">
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
              preload="metadata"
              onCanPlay={() => setVideoLoaded(true)}
              className={`w-full h-auto object-cover transition-opacity duration-700 ${videoLoaded ? 'opacity-100' : 'opacity-0 absolute'}`}
              style={{ maxHeight: '500px' }}
            />
          </div>
        </motion.div>
      )}
    </section>
  );
};

export default HeroSection;
