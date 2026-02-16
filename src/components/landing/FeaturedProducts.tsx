import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCard from '@/components/ProductCard';
import { ContentSettings } from '@/hooks/useContentSettings';
import { Product } from '@/store/cartStore';

interface FeaturedProductsProps {
  content: ContentSettings;
  products: Product[];
  isLoading: boolean;
}

const FeaturedProducts = ({ content, products, isLoading }: FeaturedProductsProps) => {
  if (products.length === 0 && !isLoading) return null;

  return (
    <section className="py-24 bg-card/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-12"
        >
          <div>
            {content.featured_products_title && (
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                {content.featured_products_title}
              </h2>
            )}
            {content.featured_products_subtitle && (
              <p className="text-muted-foreground">{content.featured_products_subtitle}</p>
            )}
          </div>
          <Link to="/products">
            <Button variant="outline" className="shrink-0">
              Όλα τα Προϊόντα
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
