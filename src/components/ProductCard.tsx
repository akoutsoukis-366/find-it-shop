import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product, useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import itagPro from '@/assets/itag-pro.png';
import itagMini from '@/assets/itag-mini.png';
import itagUltra from '@/assets/itag-ultra.png';
import itagSlim from '@/assets/itag-slim.png';
import itagPet from '@/assets/itag-pet.png';
import itagPack from '@/assets/itag-pack.png';

const productImages: Record<string, string> = {
  '1': itagPro,
  '2': itagMini,
  '3': itagUltra,
  '4': itagSlim,
  '5': itagPet,
  '6': itagPack,
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.colors[0]);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/products/${product.id}`}>
        <div className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg">
          {/* Badge */}
          {product.originalPrice && (
            <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full gradient-primary text-xs font-semibold text-primary-foreground">
              Save ${(product.originalPrice - product.price).toFixed(0)}
            </div>
          )}

          {/* Image */}
          <div className="aspect-square bg-gradient-to-b from-secondary to-card p-8 flex items-center justify-center overflow-hidden">
            <motion.img
              src={productImages[product.id] || itagPro}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
            />
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-warning text-warning" />
                <span className="text-sm font-medium text-foreground">{product.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({product.reviews} reviews)</span>
            </div>

            <div>
              <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                {product.name}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-foreground">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleAddToCart}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>

            {/* Colors */}
            <div className="flex items-center gap-2">
              {product.colors.slice(0, 4).map((color, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full border border-border"
                  style={{ backgroundColor: color }}
                />
              ))}
              {product.colors.length > 4 && (
                <span className="text-xs text-muted-foreground">+{product.colors.length - 4}</span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
