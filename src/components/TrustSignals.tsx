import { motion } from 'framer-motion';
import { Truck, ShieldCheck, Headphones, RotateCcw } from 'lucide-react';

const signals = [
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'On orders over €50',
  },
  {
    icon: ShieldCheck,
    title: '2 Year Warranty',
    description: 'Full manufacturer coverage',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Hassle-free return policy',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description: 'We\'re here to help',
  },
];

const TrustSignals = () => {
  return (
    <section className="py-16 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {signals.map((signal, index) => (
            <motion.div
              key={signal.title}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="flex flex-col items-center text-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <signal.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm">{signal.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{signal.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustSignals;
