import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Star, Truck, Shield, RefreshCcw } from 'lucide-react';
import { products } from '@/data/products';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const product = products.find((p) => p.id === id);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] || '');
  const [quantity, setQuantity] = useState(1);
  const addItem = useCartStore((state) => state.addItem);

  if (!product) {
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
      addItem(product, selectedColor);
    }
    toast.success(`${quantity} x ${product.name} added to cart!`);
  };

  const benefits = [
    { icon: Truck, text: 'Free shipping on orders over $50' },
    { icon: Shield, text: '2-year warranty included' },
    { icon: RefreshCcw, text: '30-day money-back guarantee' },
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
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="aspect-square bg-card rounded-3xl border border-border overflow-hidden flex items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                <motion.img
                  src={productImages[product.id] || itagPro}
                  alt={product.name}
                  className="relative w-full h-full object-contain"
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
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
                  Save ${(product.originalPrice - product.price).toFixed(0)}
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
                <span className="text-4xl font-bold text-foreground">${product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">
                    ${product.originalPrice}
                  </span>
                )}
              </div>

              {/* Color Selection */}
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
              >
                Add to Cart - ${(product.price * quantity).toFixed(2)}
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
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
