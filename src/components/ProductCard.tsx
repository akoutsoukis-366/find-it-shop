import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { Product, useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useCurrency } from '@/hooks/useCurrency';
import itagPro from '@/assets/itag-pro.png';
import itagMini from '@/assets/itag-mini.png';
import itagUltra from '@/assets/itag-ultra.png';
import itagSlim from '@/assets/itag-slim.png';
import itagPet from '@/assets/itag-pet.png';
import itagPack from '@/assets/itag-pack.png';

const productImageMap: Record<string, string> = {
  'itag-pro': itagPro,
  'itag-mini': itagMini,
  'itag-ultra': itagUltra,
  'itag-slim': itagSlim,
  'itag-pet': itagPet,
  'itag-pack': itagPack,
  'itag-4-pack': itagPack,
};

const getProductImage = (imagePath: string | undefined, productName: string): string => {
  // If it's a full URL (uploaded image), use it directly
  if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
    return imagePath;
  }
  // Try to match by image path
  if (imagePath) {
    const key = imagePath.split('/').pop()?.replace('.png', '') || '';
    if (productImageMap[key]) return productImageMap[key];
  }
  // Try to match by product name
  const nameKey = productName.toLowerCase().replace(/\s+/g, '-');
  return productImageMap[nameKey] || itagPro;
};

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard = ({ product, index = 0 }: ProductCardProps) => {
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.colors[0] || '#1a1a1a');
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
              Save {formatPrice(product.originalPrice - product.price)}
            </div>
          )}

          {/* Image */}
          <div className="aspect-square bg-gradient-to-b from-secondary to-card p-8 flex items-center justify-center overflow-hidden">
            <motion.img
              src={getProductImage(product.image, product.name)}
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
                <span className="text-xl font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>
              <Button
                size="icon"
                variant="secondary"
                onClick={handleAddToCart}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={!product.inStock}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>

            {/* Colors */}
            {product.colors.length > 0 && (
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
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
