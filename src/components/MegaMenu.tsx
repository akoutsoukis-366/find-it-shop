import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { useCategories } from '@/hooks/useCategories';
import { useProducts } from '@/hooks/useProducts';
import { useCurrency } from '@/hooks/useCurrency';

interface MegaMenuProps {
  isActive: boolean;
}

const MegaMenu = ({ isActive }: MegaMenuProps) => {
  const [open, setOpen] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const { categories } = useCategories();
  const { products } = useProducts();
  const { formatPrice } = useCurrency();

  const featuredProducts = products.filter(p => p.featured).slice(0, 3);

  const handleEnter = () => {
    clearTimeout(timeoutRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timeoutRef.current = setTimeout(() => setOpen(false), 200);
  };

  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  // Get first product image per category as fallback
  const getCategoryImage = (slug: string) => {
    const cat = categories.find(c => c.slug === slug);
    if (cat?.image_url) return cat.image_url;
    const product = products.find(p => p.category === slug && p.image);
    return product?.image || null;
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button
        className={`flex items-center gap-1 text-sm font-medium transition-colors ${
          isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Προϊόντα
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 z-50">
          <div className="bg-popover border border-border rounded-xl shadow-2xl w-[680px] p-6 grid grid-cols-[220px_1fr] gap-6">
            {/* Left: Categories */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Κατηγορίες
              </h3>
              <div className="space-y-1">
                <Link
                  to="/products"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ArrowRight className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                    Όλα τα Προϊόντα
                  </span>
                </Link>
                {categories.map((cat) => {
                  const img = getCategoryImage(cat.slug);
                  return (
                    <Link
                      key={cat.id}
                      to={`/products?category=${cat.slug}`}
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      {img ? (
                        <img
                          src={img}
                          alt={cat.name}
                          className="w-9 h-9 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-muted shrink-0" />
                      )}
                      <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Right: Featured Products */}
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                Δημοφιλή Προϊόντα
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {featuredProducts.map((product) => (
                  <Link
                    key={product.id}
                    to={`/products/${product.id}`}
                    onClick={() => setOpen(false)}
                    className="group rounded-lg overflow-hidden border border-border/50 hover:border-primary/30 transition-all hover:shadow-md"
                  >
                    <div className="aspect-square bg-muted overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium text-foreground truncate">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs font-bold text-primary">
                          {formatPrice(product.price)}
                        </span>
                        {product.originalPrice && (
                          <span className="text-[10px] text-muted-foreground line-through">
                            {formatPrice(product.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
