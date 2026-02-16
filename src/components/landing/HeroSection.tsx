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

      {/* Full Hero Video */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative flex-1 w-full flex items-center justify-center px-4 pt-8 pb-8"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] bg-gradient-radial from-primary/30 via-primary/10 to-transparent blur-[100px]" />
        </div>

        <div className="relative max-w-5xl 2xl:max-w-7xl w-full mx-auto flex flex-col items-center gap-8">
          <div className="relative w-full">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30 pointer-events-none z-10 rounded-2xl" />
            <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 pointer-events-none z-10 rounded-2xl" />

            {heroVideoUrl ? (
              <video
                src={heroVideoUrl}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain rounded-2xl"
                style={{ maxHeight: '70vh' }}
              />
            ) : (
              <div className="w-full h-[50vh] bg-muted/50 rounded-2xl flex items-center justify-center">
                <p className="text-muted-foreground">Δεν έχει οριστεί video</p>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none z-10 rounded-b-2xl" />
          </div>

          {/* Floating CTA buttons over bottom gradient */}
          <div className="relative z-20 -mt-20 flex flex-col sm:flex-row gap-4 justify-center">
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
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
