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
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/8 rounded-full blur-[150px] translate-x-1/3 -translate-y-1/4" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[120px] -translate-x-1/4 translate-y-1/4" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left: Text content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            className="space-y-8"
          >
            {content.hero_badge_text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm"
              >
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="text-muted-foreground">{content.hero_badge_text}</span>
              </motion.div>
            )}

            {(content.hero_title_line1 || content.hero_title_line2) && (
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.1] tracking-tight">
                {content.hero_title_line1 && <span className="block">{content.hero_title_line1}</span>}
                {content.hero_title_line2 && <span className="gradient-text block">{content.hero_title_line2}</span>}
              </h1>
            )}

            {content.hero_description && (
              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                {content.hero_description}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
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

            {/* Stats row */}
            {(content.hero_stat1_value || content.hero_stat2_value || content.hero_stat3_value) && (
              <div className="flex items-center gap-8 pt-4">
                {[
                  { value: content.hero_stat1_value, label: content.hero_stat1_label },
                  { value: content.hero_stat2_value, label: content.hero_stat2_label },
                  { value: content.hero_stat3_value, label: content.hero_stat3_label },
                ].filter(s => s.value).map((stat, i) => (
                  <div key={i} className="text-left">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative"
          >
            {/* Glow behind video */}
            <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent blur-[80px] scale-110" />
            
            <div className="relative rounded-3xl overflow-hidden border border-border/50 shadow-2xl">
              {/* Gradient overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent pointer-events-none z-10" />
              <div className="absolute inset-0 bg-gradient-to-l from-background/20 via-transparent to-transparent pointer-events-none z-10" />
              
              {heroVideoUrl ? (
                <video
                  src={heroVideoUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full aspect-[4/3] object-cover"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-muted/30 flex items-center justify-center">
                  <p className="text-muted-foreground text-sm">Δεν έχει οριστεί video</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
