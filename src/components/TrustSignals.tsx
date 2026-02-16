import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';
import { useContentSettings } from '@/hooks/useContentSettings';

const icons = [Truck, ShieldCheck, RotateCcw, Headphones];

const TrustSignals = () => {
  const { content } = useContentSettings();

  const signals = [
    { title: content.trust1_title, description: content.trust1_description },
    { title: content.trust2_title, description: content.trust2_description },
    { title: content.trust3_title, description: content.trust3_description },
    { title: content.trust4_title, description: content.trust4_description },
  ].filter(s => s.title || s.description);

  if (signals.length === 0) return null;

  return (
    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {signals.map((signal, index) => {
            const Icon = icons[index] || Truck;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  {signal.title && <h4 className="font-semibold text-foreground text-sm">{signal.title}</h4>}
                  {signal.description && <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
