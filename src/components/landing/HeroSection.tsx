import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentSettings } from '@/hooks/useContentSettings';

interface HeroSectionProps {
  content: ContentSettings;
}

const HeroSection = ({ content }: HeroSectionProps) => {
  const heroVideoUrl = content.hero_video_url || '';

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

          {(content.hero_title_line1 || content.hero_title_line2) && (
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-tight">
              {content.hero_title_line1 && <span className="block sm:inline">{content.hero_title_line1}</span>}
              {content.hero_title_line1 && content.hero_title_line2 && ' '}
              {content.hero_title_line2 && <span className="gradient-text block sm:inline">{content.hero_title_line2}</span>}
            </h1>
          )}

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
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative flex-1 w-full flex items-center justify-center px-4 pb-8"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-[100px]" />
        </div>

        <div className="relative max-w-4xl w-full mx-auto">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/50 pointer-events-none z-10 rounded-2xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-background/30 via-transparent to-background/30 pointer-events-none z-10 rounded-2xl" />

          {heroVideoUrl ? (
            <video
              src={heroVideoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-auto object-contain rounded-2xl"
              style={{ maxHeight: '500px' }}
            />
          ) : (
            <div className="w-full h-[400px] bg-muted/50 rounded-2xl flex items-center justify-center">
              <p className="text-muted-foreground">Δεν έχει οριστεί video</p>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 rounded-b-2xl" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
