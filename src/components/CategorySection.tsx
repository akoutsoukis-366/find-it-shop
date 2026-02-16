import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Zap, Battery, MapPin, Wrench } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';

const categoryIcons: Record<string, React.ElementType> = {
  'holographic-fans': Zap,
  'power-banks': Battery,
  'airtags': MapPin,
  'accessories': Wrench,
};

const CategorySection = () => {
  const { categories, isLoading } = useCategories();

  if (isLoading || categories.length === 0) return null;

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Αγόρασε ανά Κατηγορία
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Εξερεύνησε τις συλλογές μας από premium tech προϊόντα.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => {
            const Icon = categoryIcons[category.slug] || Zap;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <Link
                  to={`/products?category=${category.slug}`}
                  className="group block p-8 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 text-center relative overflow-hidden"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-5 group-hover:shadow-button transition-shadow">
                      <Icon className="w-6 h-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground group-hover:text-primary transition-colors">
                      Περιήγηση
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
