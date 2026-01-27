import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Star, Truck, Shield, RefreshCcw, Loader2 } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { useCartStore } from '@/store/cartStore';
import { useCurrency } from '@/hooks/useCurrency';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductGallery from '@/components/ProductGallery';
import { toast } from 'sonner';
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { product, isLoading, error } = useProduct(id);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);
  const { formatPrice } = useCurrency();
  const [benefitSettings, setBenefitSettings] = useState({
    freeShippingThreshold: 50,
    warrantyYears: 2,
    returnDays: 30,
  });

  useEffect(() => {
    const fetchBenefitSettings = async () => {
      try {
        const { data } = await supabase
          .from('settings')
          .select('key, value')
          .in('key', ['free_shipping_threshold', 'warranty_years', 'return_days']);

        if (data) {
          const settingsMap: Record<string, string> = {};
          data.forEach((item) => {
            settingsMap[item.key] = item.value || '';
          });

          setBenefitSettings({
            freeShippingThreshold: parseFloat(settingsMap.free_shipping_threshold || '50'),
            warrantyYears: parseInt(settingsMap.warranty_years || '2'),
            returnDays: parseInt(settingsMap.return_days || '30'),
          });
        }
      } catch (error) {
        console.error('Error fetching benefit settings:', error);
      }
    };

    fetchBenefitSettings();
  }, []);

  // Set default color when product loads
  if (product && !selectedColor && product.colors.length > 0) {
    setSelectedColor(product.colors[0]);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Product not found</h1>
          <Link to="/products">
            <Button>Back to Products</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(product, selectedColor || product.colors[0]);
    }
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const benefits = [
    { icon: Truck, text: benefitSettings.freeShippingThreshold > 0 
      ? `Free shipping on orders over ${formatPrice(benefitSettings.freeShippingThreshold)}` 
      : 'Free shipping on all orders' },
    { icon: Shield, text: `${benefitSettings.warrantyYears}-year warranty included` },
    { icon: RefreshCcw, text: `${benefitSettings.returnDays}-day money-back guarantee` },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link to="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8">
            <ArrowLeft className="h-4 w-4" />
            Back to Products
          </Link>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Product Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <ProductGallery
                images={product.mediaUrls || []}
                productName={product.name}
                mainImage={getProductImage(product.image, product.name)}
              />
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Badge */}
              {product.originalPrice && (
                <div className="inline-block px-3 py-1 rounded-full gradient-primary text-sm font-semibold text-primary-foreground">
                  Save {formatPrice(product.originalPrice - product.price)}
                </div>
              )}

              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 fill-warning text-warning" />
                    <span className="font-medium text-foreground">{product.rating}</span>
                  </div>
                  <span className="text-muted-foreground">({product.reviews} reviews)</span>
                </div>
              </div>

              <p className="text-lg text-muted-foreground">{product.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-foreground">{formatPrice(product.price)}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    {formatPrice(product.originalPrice)}
                  </span>
                )}
              </div>

              {/* Color Selection */}
              {product.colors.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${
                          selectedColor === color
                            ? 'border-primary scale-110'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-medium text-foreground w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={handleAddToCart}
                disabled={!product.inStock}
              >
                {product.inStock 
                  ? `Add to Cart - ${formatPrice(product.price * quantity)}`
                  : 'Out of Stock'
                }
              </Button>

              {/* Benefits */}
              <div className="space-y-4 pt-6 border-t border-border">
                {benefits.map((benefit) => (
                  <div key={benefit.text} className="flex items-center gap-3">
                    <benefit.icon className="h-5 w-5 text-primary" />
                    <span className="text-muted-foreground">{benefit.text}</span>
                  </div>
                ))}
              </div>

              {/* Specifications */}
              {product.specs && product.specs.length > 0 && (
                <div className="pt-6 border-t border-border">
                  <h3 className="text-lg font-semibold text-foreground mb-4">Specifications</h3>
                  <div className="space-y-3">
                    {product.specs.map((spec, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                        <span className="text-muted-foreground">{spec.label}</span>
                        <span className="font-medium text-foreground">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
