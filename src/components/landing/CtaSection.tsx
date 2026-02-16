import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContentSettings } from '@/hooks/useContentSettings';

interface CtaSectionProps {
  content: ContentSettings;
}

const CtaSection = ({ content }: CtaSectionProps) => {
  if (!content.cta_title_line1 && !content.cta_title_line2 && !content.cta_description && !content.cta_button_text) {
    return null;
  }

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto"
        >
          {(content.cta_title_line1 || content.cta_title_line2) && (
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              {content.cta_title_line1}
              {content.cta_title_line1 && content.cta_title_line2 && <br />}
              {content.cta_title_line2 && <span className="gradient-text">{content.cta_title_line2}</span>}
            </h2>
          )}
          {content.cta_description && (
            <p className="text-xl text-muted-foreground mb-8">{content.cta_description}</p>
          )}
          {content.cta_button_text && (
            <Link to="/products">
              <Button variant="hero" size="xl">
                {content.cta_button_text}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default CtaSection;
