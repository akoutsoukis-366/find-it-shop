import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';

const CategorySection = () => {
  const { categories, isLoading: catLoading } = useCategories();
  const { products, isLoading: prodLoading } = useProducts();

  if (catLoading || categories.length === 0) return null;

  // Count products per category
  const countByCategory = (slug: string) => products.filter(p => p.category === slug).length;

  // Pick a representative product image for each category
  const getCategoryImage = (slug: string) => {
    const product = products.find(p => p.category === slug && p.image);
    return product?.image;
  };

  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
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
            const count = countByCategory(category.slug);
            const image = getCategoryImage(category.slug);

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
                  className="group block rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 relative overflow-hidden"
                >
                  {/* Category product image */}
                  <div className="aspect-[4/3] bg-gradient-to-b from-secondary/50 to-card relative overflow-hidden">
                    {image ? (
                      <img
                        src={image}
                        alt={category.name}
                        className="w-full h-full object-contain p-6 group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                          <ArrowRight className="w-6 h-6 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                  </div>

                  {/* Text content */}
                  <div className="p-6 pt-2">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {!prodLoading && count > 0 && (
                        <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-full">
                          {count} {count === 1 ? 'προϊόν' : 'προϊόντα'}
                        </span>
                      )}
                    </div>
                    {category.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {category.description}
                      </p>
                    )}
                    <div className="flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
