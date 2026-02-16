import { motion } from 'framer-motion';
import { Truck, Clock, ShieldCheck } from 'lucide-react';
import { ContentSettings } from '@/hooks/useContentSettings';

const featureIcons = [Truck, Clock, ShieldCheck];

interface FeaturesStripProps {
  content: ContentSettings;
}

const FeaturesStrip = ({ content }: FeaturesStripProps) => {
  const features = [
    { title: content.feature1_title, description: content.feature1_description },
    { title: content.feature2_title, description: content.feature2_description },
    { title: content.feature3_title, description: content.feature3_description },
  ].filter(f => f.title || f.description);

  if (features.length === 0 && !content.features_title) return null;

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        {(content.features_title || content.features_subtitle) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            {content.features_title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
                {content.features_title}
              </h2>
            )}
            {content.features_subtitle && (
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {content.features_subtitle}
              </p>
            )}
          </motion.div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = featureIcons[index] || Truck;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative p-8 rounded-2xl bg-card/80 border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden"
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <div className="relative z-10 flex flex-col items-start gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-button/30">
                    <Icon className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <div>
                    {feature.title && (
                      <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    )}
                    {feature.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesStrip;
